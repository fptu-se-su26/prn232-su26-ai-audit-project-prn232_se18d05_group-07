using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class RoomAmenity
    {
        public int RoomId { get; set; }
        public int AmenityId { get; set; }

        // Navigation
        public virtual Room Room { get; set; } = null!;
        public virtual Amenity Amenity { get; set; } = null!;
    }
}
