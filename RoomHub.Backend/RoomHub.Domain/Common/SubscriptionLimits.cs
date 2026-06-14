using Domain.Enums;

namespace Domain.Common
{
    public static class SubscriptionLimits
    {
        public static int GetMaxBuildings(SubscriptionPlan plan) => plan switch
        {
            SubscriptionPlan.Free => 1,
            SubscriptionPlan.Monthly => 3,
            SubscriptionPlan.Yearly => 3,
            _ => int.MaxValue
        };

        public static int GetMaxRooms(SubscriptionPlan plan) => plan switch
        {
            SubscriptionPlan.Free => 3,
            SubscriptionPlan.Monthly => 30,
            SubscriptionPlan.Yearly => 30,
            _ => int.MaxValue
        };

        public static int GetMaxAiAudits(SubscriptionPlan plan) => plan switch
        {
            SubscriptionPlan.Free => 3,
            _ => int.MaxValue
        };
    }
}
