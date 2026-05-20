"""
Simulation tools — mock API calls, notifications, dashboard updates.
These are registered as ADK FunctionTools for the Simulation Engine agent.
"""
import json
from datetime import datetime


def mock_api_call(endpoint: str, method: str, payload: dict) -> dict:
    """
    Simulate an API call to an external service.

    Args:
        endpoint: The API endpoint being called (e.g., /api/campaigns/create).
        method: HTTP method (POST, PUT, PATCH).
        payload: The request payload being sent.

    Returns:
        A simulated API response with status and data.
    """
    return {
        "status": 200,
        "endpoint": endpoint,
        "method": method,
        "response_time_ms": 312,
        "response": {
            "success": True,
            "message": f"Action executed successfully via {method} {endpoint}",
            "request_id": f"req_{datetime.now().strftime('%H%M%S')}",
            "payload_received": payload,
        },
        "timestamp": datetime.now().isoformat(),
    }


def generate_notification(notification_type: str, recipient: str, message: str) -> dict:
    """
    Generate a simulated notification (email, SMS, or push).

    Args:
        notification_type: Type of notification — 'email', 'sms', or 'push'.
        recipient: The recipient address/number/user.
        message: The notification message content.

    Returns:
        A notification record with delivery status.
    """
    return {
        "type": notification_type,
        "recipient": recipient,
        "message": message,
        "status": "delivered",
        "delivered_at": datetime.now().isoformat(),
        "notification_id": f"notif_{notification_type}_{datetime.now().strftime('%H%M%S')}",
    }


def update_dashboard(metric_name: str, old_value: float, new_value: float, unit: str) -> dict:
    """
    Simulate updating a dashboard metric.

    Args:
        metric_name: Name of the metric being updated (e.g., 'monthly_sales').
        old_value: The previous value of the metric.
        new_value: The new value after the action.
        unit: The unit of measurement (e.g., 'units', 'USD', '%').

    Returns:
        A dashboard update record showing the change.
    """
    change = new_value - old_value
    change_pct = (change / old_value * 100) if old_value != 0 else 0
    return {
        "metric": metric_name,
        "previous": old_value,
        "current": new_value,
        "change": change,
        "change_percent": round(change_pct, 1),
        "unit": unit,
        "updated_at": datetime.now().isoformat(),
    }
