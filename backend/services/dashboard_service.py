from models.customer import Customer


class DashboardService:

    @staticmethod
    def get_dashboard_stats():

        total_customers = Customer.query.count()

        interested = Customer.query.filter(
            Customer.state.ilike("%Interested%")
        ).count()

        registered = Customer.query.filter(
            Customer.state == "Closed"
        ).count()

        follow_up = Customer.query.filter(
            Customer.state.ilike("%Next Batch%")
        ).count()

        return {
            "total_customers": total_customers,
            "interested": interested,
            "registered": registered,
            "follow_up": follow_up
        }