using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Common.DTOs.Services;
using Application.Common.Interfaces;
using Domain.Entities;

namespace Application.Services
{
    public class ServiceCatalogService : IServiceCatalogService
    {
        private readonly IServiceRepository _repository;
        private readonly IUnitOfWork _unitOfWork;

        public ServiceCatalogService(IServiceRepository repository, IUnitOfWork unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }

        public async Task<List<ServiceDto>> GetAllAsync()
        {
            var services = await _repository.GetAllAsync();
            return services.Select(MapToDto).ToList();
        }

        public async Task<ServiceDto> CreateAsync(CreateServiceRequest request)
        {
            Validate(request.Name, request.BasePrice, request.CommissionRate);

            var service = new Service
            {
                Name = request.Name.Trim(),
                Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim(),
                BasePrice = request.BasePrice,
                CommissionRate = request.CommissionRate
            };
            await _repository.AddAsync(service);
            await _unitOfWork.SaveChangesAsync();
            return MapToDto(service);
        }

        public async Task<ServiceDto?> UpdateAsync(int id, UpdateServiceRequest request)
        {
            Validate(request.Name, request.BasePrice, request.CommissionRate);

            var service = await _repository.GetByIdAsync(id);
            if (service == null)
                return null;

            service.Name = request.Name.Trim();
            service.Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim();
            service.BasePrice = request.BasePrice;
            service.CommissionRate = request.CommissionRate;

            await _repository.UpdateAsync(service);
            await _unitOfWork.SaveChangesAsync();
            return MapToDto(service);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var service = await _repository.GetByIdAsync(id);
            if (service == null)
                return false;

            await _repository.DeleteAsync(service);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        private static void Validate(string? name, decimal basePrice, decimal commissionRate)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Tên dịch vụ không được để trống.");
            if (basePrice < 0)
                throw new ArgumentException("Giá dịch vụ không hợp lệ.");
            if (commissionRate < 0 || commissionRate > 1)
                throw new ArgumentException("Tỷ lệ hoa hồng phải trong khoảng 0 đến 1.");
        }

        private static ServiceDto MapToDto(Service s) => new()
        {
            Id = s.Id,
            Name = s.Name,
            Description = s.Description,
            BasePrice = s.BasePrice,
            CommissionRate = s.CommissionRate
        };
    }
}
