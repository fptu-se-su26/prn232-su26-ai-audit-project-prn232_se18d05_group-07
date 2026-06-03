using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using System.ComponentModel.DataAnnotations;

namespace Domain.Enums
{
    public enum RoomType
    {
        [Display(Name = "Phòng trọ")]
        BoardingHouse,
        
        [Display(Name = "Studio")]
        Studio,
        
        [Display(Name = "Căn hộ mini")]
        MiniApartment,
        
        [Display(Name = "Căn hộ")]
        Apartment
    }
}
