using System;

namespace Application.Common.DTOs.Properties
{
    public class UpdateUnitDetailsRequest
    {
        public int MaxCapacity { get; set; }
        public string WaterBillingType { get; set; } = "PerCubicMeter";
        public decimal WaterPrice { get; set; }
        public decimal ElectricityPrice { get; set; }
        public decimal InternetPrice { get; set; }
        public decimal GarbagePrice { get; set; }
        public decimal Price { get; set; } // BasePrice
        public decimal Area { get; set; }  // SurfaceArea
    }
}
