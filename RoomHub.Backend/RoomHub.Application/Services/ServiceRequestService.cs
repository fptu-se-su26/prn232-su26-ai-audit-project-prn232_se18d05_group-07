using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Common.DTOs.Services;
using Application.Common.Interfaces;
using Domain.Entities;

namespace Application.Services
{
    public class ServiceRequestService : IServiceRequestService
    {
        private static readonly string[] OwnerStatuses = { "Approved", "Completed", "Rejected" };

        private readonly IServiceRequestRepository _repository;
        private readonly IUnitOfWork _unitOfWork;

        public ServiceRequestService(IServiceRequestRepository repository, IUnitOfWork unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }

        public async Task<ServiceRequestDto> CreateAsync(string tenantId, CreateServiceRequestRequest request)
        {
            var service = await _repository.GetServiceAsync(request.ServiceId);
            if (service == null)
                throw new ArgumentException("Không tìm thấy dịch vụ.");

            var contract = await _repository.GetActiveContractForTenantAsync(tenantId);
            if (contract == null)
                throw new InvalidOperationException("Bạn cần có hợp đồng thuê đang hiệu lực để yêu cầu dịch vụ.");

            var entity = new ServiceRequest
            {
                ServiceId = service.Id,
                ContractId = contract.Id,
                RequestDate = DateTime.UtcNow,
                Status = "Pending",
                Amount = service.BasePrice
            };
            await _repository.AddAsync(entity);
            await _unitOfWork.SaveChangesAsync();

            var created = await _repository.GetByIdAsync(entity.Id);
            return MapToDto(created!);
        }

        public async Task<List<ServiceRequestDto>> GetMyAsync(string tenantId)
        {
            var items = await _repository.GetByTenantIdAsync(tenantId);
            return items.Select(MapToDto).ToList();
        }

        public async Task<bool> CancelAsync(int id, string tenantId)
        {
            var req = await _repository.GetByIdAsync(id);
            if (req == null || req.Contract?.TenantId != tenantId)
                return false;
            if (!string.Equals(req.Status, "Pending", StringComparison.OrdinalIgnoreCase))
                return false;

            await _repository.DeleteAsync(req);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<List<ServiceRequestDto>> GetForOwnerAsync(string ownerId)
        {
            var items = await _repository.GetByOwnerIdAsync(ownerId);
            return items.Select(MapToDto).ToList();
        }

        public async Task<ServiceRequestDto?> UpdateStatusAsync(int id, string ownerId, UpdateServiceRequestStatusRequest request)
        {
            var status = request.Status?.Trim();
            if (string.IsNullOrWhiteSpace(status) ||
                !OwnerStatuses.Contains(status, StringComparer.OrdinalIgnoreCase))
                throw new ArgumentException("Trạng thái không hợp lệ.");

            var req = await _repository.GetByIdAsync(id);
            if (req == null || req.Contract?.OwnerId != ownerId)
                return null;

            // Chuẩn hóa lại đúng chữ hoa/thường của trạng thái hợp lệ.
            req.Status = OwnerStatuses.First(s => string.Equals(s, status, StringComparison.OrdinalIgnoreCase));
            if (request.Amount.HasValue && request.Amount.Value >= 0)
                req.Amount = request.Amount.Value;

            await _repository.UpdateAsync(req);
            await _unitOfWork.SaveChangesAsync();
            return MapToDto(req);
        }

        private static ServiceRequestDto MapToDto(ServiceRequest r) => new()
        {
            Id = r.Id,
            ServiceId = r.ServiceId,
            ServiceName = r.Service?.Name ?? "Dịch vụ",
            ContractId = r.ContractId,
            RoomTitle = r.Contract?.Room?.Title,
            TenantName = r.Contract?.Tenant?.FullName ?? r.Contract?.TemporaryTenantName,
            RequestDate = r.RequestDate,
            Status = r.Status,
            Amount = r.Amount
        };
    }
}
