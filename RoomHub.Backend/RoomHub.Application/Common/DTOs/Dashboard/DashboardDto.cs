using System;
using System.Collections.Generic;

namespace Application.Common.DTOs.Dashboard
{
    public class DashboardTaskDto
    {
        public string Title { get; set; } = null!;
        public string Description { get; set; } = null!;
        public string ActionType { get; set; } = null!; // invoices, properties, listings, etc.
    }

    public class DashboardActivityDto
    {
        public string Text { get; set; } = null!;
        public string Time { get; set; } = null!;
        public string Type { get; set; } = "info"; // campaign, person_add, receipt_long, etc.
    }

    public class RevenueChartDataDto
    {
        public string Month { get; set; } = null!;
        public decimal Revenue { get; set; }
        public decimal Unpaid { get; set; }
    }

    public class DashboardDto
    {
        public int TotalProperties { get; set; }
        public int TotalRooms { get; set; }
        public int VacantRooms { get; set; }
        public int OccupiedRooms { get; set; }
        public int ActiveListings { get; set; }
        public int UnpaidInvoicesCount { get; set; }
        public decimal RevenueThisMonth { get; set; }
        public bool IsMockData { get; set; }

        public List<DashboardTaskDto> Tasks { get; set; } = new();
        public List<DashboardActivityDto> RecentActivities { get; set; } = new();
        public List<RevenueChartDataDto> RevenueChartData { get; set; } = new();
    }
}
