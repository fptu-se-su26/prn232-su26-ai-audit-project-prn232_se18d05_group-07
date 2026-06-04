using System.Collections.Generic;
using System.Threading.Tasks;
using Application.Common.DTOs.Invoices;

namespace Application.Common.Interfaces
{
    public interface IInvoiceService
    {
        Task<List<InvoiceHeaderDto>> GetOwnerInvoicesAsync(string ownerId);
        Task<InvoiceDetailDto?> GetInvoiceDetailAsync(int invoiceId, string ownerId);
        Task<bool> CreateBatchInvoicesAsync(BatchInvoiceRequest request, string ownerId);
        Task<bool> RecordPaymentAsync(int invoiceId, RecordPaymentRequest request, string ownerId);
        Task<bool> CancelInvoiceAsync(int invoiceId, string ownerId);
        Task<byte[]> ExportInvoiceToExcelAsync(int invoiceId, string ownerId);
    }
}
