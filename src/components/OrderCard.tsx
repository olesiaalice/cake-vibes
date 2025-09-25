import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Phone, Mail, User, Package } from 'lucide-react';
import { format } from 'date-fns';
import type { OrderWithItems, OrderStatus } from '@/types/order';
interface OrderCardProps {
  order: OrderWithItems;
  onUpdateStatus?: (orderId: string, status: OrderStatus) => void;
  showActions?: boolean;
}
const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onUpdateStatus,
  showActions = false
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'preparing':
        return 'bg-orange-100 text-orange-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'delivered':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  const getStatusActions = (currentStatus: string) => {
    switch (currentStatus) {
      case 'pending':
        return ['confirmed', 'cancelled'];
      case 'confirmed':
        return ['preparing', 'cancelled'];
      case 'preparing':
        return ['ready'];
      case 'ready':
        return ['delivered'];
      default:
        return [];
    }
  };
  return <Card className="shadow-soft hover:shadow-floating transition-all duration-300 w-full overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between mx-0 px-0">
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium text-muted-foreground">
              Order #{order.id.slice(0, 8)}
            </div>
            <Badge className={`${getStatusColor(order.status)} border-0`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">
              {format(new Date(order.created_at), 'MMM dd, HH:mm')}
            </div>
            <div className="font-semibold text-lg">
              ${order.total_amount.toFixed(2)}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 sm:px-4 px-[15px]">
        {/* Customer Info */}
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{order.customer_name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{order.customer_email}</span>
            </div>
            {order.customer_phone && <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{order.customer_phone}</span>
              </div>}
          </div>
          <div className="space-y-2">
            {order.delivery_date && <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{format(new Date(order.delivery_date), 'PPP')}</span>
              </div>}
            {order.delivery_address && <div className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span className="line-clamp-2">{order.delivery_address}</span>
              </div>}
          </div>
        </div>

        {/* Order Items */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span>Items ({order.order_items.length})</span>
          </div>
          <div className="grid gap-2">
            {order.order_items.map(item => <div key={item.id} className="flex items-center justify-between py-2 px-2 sm:px-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <img src={item.products.image} alt={item.products.name} className="w-10 h-10 object-cover rounded-lg" />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm truncate">{item.products.name}</div>
                      <div className="text-xs text-muted-foreground">
                        Qty: {item.quantity} × ${item.price_per_item.toFixed(2)}
                      </div>
                    </div>
                </div>
                <div className="font-medium text-sm whitespace-nowrap">
                  ${(item.quantity * item.price_per_item).toFixed(2)}
                </div>
              </div>)}
          </div>
        </div>

        {/* Special Instructions */}
        {order.special_instructions && <div className="p-2 sm:p-3 bg-muted/30 rounded-lg">
            <div className="text-sm font-medium mb-1">Special Instructions:</div>
            <div className="text-sm text-muted-foreground">{order.special_instructions}</div>
          </div>}

        {/* Actions */}
        {showActions && onUpdateStatus && <div className="flex flex-wrap gap-2 pt-2">
            {getStatusActions(order.status).map(action => <Button key={action} variant="outline" size="sm" onClick={() => onUpdateStatus(order.id, action as OrderStatus)} className="capitalize">
                Mark as {action}
              </Button>)}
          </div>}
      </CardContent>
    </Card>;
};
export default OrderCard;