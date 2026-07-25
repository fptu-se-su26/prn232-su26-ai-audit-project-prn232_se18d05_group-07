using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Common.DTOs.Maintenance;
using Application.Common.Interfaces;
using Domain.Entities;
using Domain.Enums;

namespace Application.Services
{
    public class MaintenanceTicketService : IMaintenanceTicketService
    {
        private readonly IMaintenanceTicketRepository _repository;
        private readonly IContractService _contractService;
        private readonly IUnitOfWork _unitOfWork;

        public MaintenanceTicketService(
            IMaintenanceTicketRepository repository,
            IContractService contractService,
            IUnitOfWork unitOfWork)
        {
            _repository = repository;
            _contractService = contractService;
            _unitOfWork = unitOfWork;
        }

        public async Task<MaintenanceTicketDto> CreateTicketAsync(string tenantId, CreateMaintenanceTicketRequest request)
        {
            var title = request.Title?.Trim();
            if (string.IsNullOrWhiteSpace(title))
                throw new ArgumentException("Tiêu đề yêu cầu không được để trống.");
            if (title.Length > 200)
                throw new ArgumentException("Tiêu đề tối đa 200 ký tự.");

            // Xác định phòng người thuê đang ở để gắn yêu cầu.
            var room = await _contractService.GetActiveRoomForTenantAsync(tenantId);
            if (room == null)
                throw new InvalidOperationException("Bạn cần đang thuê một phòng để gửi yêu cầu bảo trì.");

            var ticket = new MaintenanceTicket
            {
                RoomId = room.RoomId,
                TenantId = tenantId,
                Title = title,
                Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim(),
                Status = TicketStatus.Open,
                CreatedAt = DateTime.UtcNow
            };

            await _repository.AddAsync(ticket);
            await _unitOfWork.SaveChangesAsync();

            var created = await _repository.GetByIdAsync(ticket.Id);
            return MapToDto(created!);
        }

        public async Task<List<MaintenanceTicketDto>> GetMyTicketsAsync(string tenantId)
        {
            var tickets = await _repository.GetByTenantIdAsync(tenantId);
            return tickets.Select(MapToDto).ToList();
        }

        public async Task<bool> CancelTicketAsync(int id, string tenantId)
        {
            var ticket = await _repository.GetByIdAsync(id);
            if (ticket == null || ticket.TenantId != tenantId)
                return false;

            // Chỉ cho hủy khi yêu cầu chưa được chủ trọ xử lý.
            if (ticket.Status != TicketStatus.Open)
                return false;

            await _repository.DeleteAsync(ticket);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        private static MaintenanceTicketDto MapToDto(MaintenanceTicket t)
        {
            return new MaintenanceTicketDto
            {
                Id = t.Id,
                RoomId = t.RoomId,
                RoomTitle = t.Room?.Title,
                Title = t.Title,
                Description = t.Description,
                Status = t.Status.ToString(),
                CreatedAt = t.CreatedAt,
                ResolvedAt = t.ResolvedAt
            };
        }
    }
}
