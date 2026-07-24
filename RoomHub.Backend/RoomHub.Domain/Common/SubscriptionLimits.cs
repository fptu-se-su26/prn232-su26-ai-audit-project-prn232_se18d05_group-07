using Domain.Enums;

namespace Domain.Common
{
    public static class SubscriptionLimits
    {
        public static int GetMaxBuildings(SubscriptionPlan plan) => plan switch
        {
            SubscriptionPlan.Free => 1,
            SubscriptionPlan.Monthly => 5,
            SubscriptionPlan.Yearly => 10,
            _ => int.MaxValue
        };

        public static int GetMaxRooms(SubscriptionPlan plan) => plan switch
        {
            SubscriptionPlan.Free => 10,
            SubscriptionPlan.Monthly => 100,
            SubscriptionPlan.Yearly => 250,
            _ => int.MaxValue
        };

        public static int GetMaxAiAudits(SubscriptionPlan plan) => plan switch
        {
            SubscriptionPlan.Free => 3,
            _ => int.MaxValue
        };
    }
}
