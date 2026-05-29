using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Persistence.Configurations
{
    public class RoleSeedConfiguration : IEntityTypeConfiguration<IdentityRole>
    {
        public void Configure(EntityTypeBuilder<IdentityRole> builder)
        {
            builder.HasData(
                new IdentityRole
                {
                    Id = "admin-role-id",
                    Name = "Administrator",
                    NormalizedName = "ADMINISTRATOR",
                    ConcurrencyStamp = "1"
                },
                new IdentityRole
                {
                    Id = "owner-role-id",
                    Name = "PropertyOwner",
                    NormalizedName = "PROPERTYOWNER",
                    ConcurrencyStamp = "2"
                },
                new IdentityRole
                {
                    Id = "tenant-role-id",
                    Name = "Tenant",
                    NormalizedName = "TENANT",
                    ConcurrencyStamp = "3"
                }
            );
        }
    }
}
