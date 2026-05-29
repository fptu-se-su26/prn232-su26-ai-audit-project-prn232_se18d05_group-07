using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class Amenity
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string? IconUrl { get; set; }

        // Navigation
        public virtual ICollection<RoomAmenity> RoomAmenities { get; set; } = new List<RoomAmenity>();
    }
}
