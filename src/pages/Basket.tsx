import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, Calendar, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useCart } from '@/contexts/CartContext';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const Basket = () => {
  const navigate = useNavigate();
  const { items, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCart();
  const [deliveryDate, setDeliveryDate] = useState<Date>();
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    holderName: ''
  });
  const [specialNotes, setSpecialNotes] = useState('');

  const handlePlaceOrder = () => {
    if (items.length === 0) {
      toast({
        title: "Empty basket",
        description: "Please add some items to your basket first.",
        variant: "destructive"
      });
      return;
    }

    if (!deliveryDate) {
      toast({
        title: "Delivery date required",
        description: "Please select a delivery date.",
        variant: "destructive"
      });
      return;
    }

    if (!paymentInfo.cardNumber || !paymentInfo.expiryDate || !paymentInfo.cvv || !paymentInfo.holderName) {
      toast({
        title: "Payment information required",
        description: "Please fill in all payment details.",
        variant: "destructive"
      });
      return;
    }

    // Simulate order processing
    toast({
      title: "Order placed successfully!",
      description: "Your delicious cakes will be delivered on " + format(deliveryDate, 'PPP'),
    });

    clearCart();
    navigate('/');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-warm">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
          <div className="flex items-center justify-between p-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-semibold text-lg">Basket</h1>
            <div className="w-10" />
          </div>
        </div>

        <div className="flex flex-col items-center justify-center h-96 px-4">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-xl font-semibold mb-2">Your basket is empty</h2>
          <p className="text-muted-foreground text-center mb-6">
            Browse our delicious cakes and add them to your basket
          </p>
          <Button onClick={() => navigate('/')} className="bg-gradient-accent text-white">
            Browse Cakes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-warm">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold text-lg">Basket ({items.length})</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="px-4 pb-6">
        {/* Cart Items */}
        <div className="space-y-4 mb-6">
          {items.map((item, index) => (
            <Card key={`${item.product.id}-${index}`} className="shadow-soft">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.product.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      ${item.product.price.toFixed(2)} × {item.quantity}
                    </p>
                    
                    {item.customization && (
                      <div className="text-xs text-muted-foreground mb-2">
                        <p>Size: {item.customization.size}</p>
                        {item.customization.toppings.length > 0 && (
                          <p>Toppings: {item.customization.toppings.join(', ')}</p>
                        )}
                        <p>Color: {item.customization.color}</p>
                        <p>Flavor: {item.customization.flavor}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="h-8 w-8 rounded-full"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="h-8 w-8 rounded-full"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <span className="font-semibold">${item.totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Delivery Date */}
        <Card className="mb-6 shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Delivery Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !deliveryDate && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {deliveryDate ? format(deliveryDate, "PPP") : "Pick a delivery date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={deliveryDate}
                  onSelect={setDeliveryDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </CardContent>
        </Card>

        {/* Payment Information */}
        <Card className="mb-6 shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="holderName">Cardholder Name</Label>
              <Input
                id="holderName"
                placeholder="John Doe"
                value={paymentInfo.holderName}
                onChange={(e) => setPaymentInfo(prev => ({ ...prev, holderName: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={paymentInfo.cardNumber}
                onChange={(e) => setPaymentInfo(prev => ({ ...prev, cardNumber: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  placeholder="MM/YY"
                  value={paymentInfo.expiryDate}
                  onChange={(e) => setPaymentInfo(prev => ({ ...prev, expiryDate: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  value={paymentInfo.cvv}
                  onChange={(e) => setPaymentInfo(prev => ({ ...prev, cvv: e.target.value }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Special Notes */}
        <Card className="mb-6 shadow-soft">
          <CardHeader>
            <CardTitle>Special Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Any additional notes or special requests..."
              value={specialNotes}
              onChange={(e) => setSpecialNotes(e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card className="mb-6 shadow-soft">
          <CardContent className="p-6">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${getTotalPrice().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery</span>
                <span>$5.00</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>${(getTotalPrice() + 5).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <Button
              onClick={handlePlaceOrder}
              className="w-full py-6 text-lg font-semibold bg-gradient-accent text-white rounded-xl shadow-floating"
            >
              Place Order
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Basket;