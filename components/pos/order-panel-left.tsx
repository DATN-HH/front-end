"use client"

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input'; // For potential quantity display if editable in row
import { Separator } from '@/components/ui/separator'; // Will create this manually
import { User, FileText, Undo2, SplitSquareHorizontal, Printer, MessageSquare, Delete, Edit3, PlusCircle, MinusCircle } from 'lucide-react';

// Mock data types
interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  note?: string;
}

const initialOrderItems: OrderItem[] = [
  { id: '1', name: 'Spicy Chicken Burger', quantity: 2, unitPrice: 12.50, note: "Extra pickles, no onions please, make it quick!" },
  { id: '2', name: 'Coca-Cola Zero', quantity: 4, unitPrice: 2.00 },
  { id: '3', name: 'Large Fries with Mayo', quantity: 1, unitPrice: 4.50, note: "Extra mayo on the side" },
  { id: '4', name: 'Margherita Pizza', quantity: 1, unitPrice: 15.00 },
  { id: '5', name: 'Side Salad', quantity: 1, unitPrice: 3.50, note: "Vinaigrette dressing" },
];

type NumpadAction = 'Qty' | '% Disc' | 'Price' | null;

export default function OrderPanelLeft() {
  const [orderItems, setOrderItems] = useState<OrderItem[]>(initialOrderItems);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState<string | null>("Loredana P."); // Mock customer
  const [activeNumpadAction, setActiveNumpadAction] = useState<NumpadAction>(null);
  const [numpadInput, setNumpadInput] = useState<string>("");

  const primaryOrange = "hsl(var(--primary))";
  const lightOrangeBg = "hsl(var(--primary-orange-light), 0.3)"; // Lighter for selected row

  const calculateLineTotal = (item: OrderItem) => item.quantity * item.unitPrice;
  const calculateOrderTotal = () => orderItems.reduce((sum, item) => sum + calculateLineTotal(item), 0);

  const handleNumpadKeyPress = (key: string) => {
    if (key === "CLR") {
      setNumpadInput("");
    } else if (key === "⌫") {
      setNumpadInput(prev => prev.slice(0, -1));
    } else if (key === "." && numpadInput.includes(".")) {
      return; // Only one decimal point
    }
    else {
      setNumpadInput(prev => prev + key);
    }
    // TODO: Apply numpadInput to selected item based on activeNumpadAction
  };

  const numpadKeys = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '.', '0', '⌫'];


  return (
    <div className="flex flex-col h-full w-full max-w-md bg-white shadow-lg border-r border-gray-200">
      {/* Order Items List Area */}
      <ScrollArea className="flex-grow p-4">
        {orderItems.length === 0 ? (
          <p className="text-center text-gray-500 py-10">No items in order</p>
        ) : (
          orderItems.map((item) => (
            <div
              key={item.id}
              className={`p-3 border-b border-gray-200 cursor-pointer ${
                selectedItemId === item.id ? 'bg-primary-orange-light border-l-4 border-primary-orange' : 'hover:bg-gray-50'
              }`}
              onClick={() => setSelectedItemId(item.id)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-grow">
                  <p className="font-bold text-gray-800">{item.name}</p>
                  <p className="text-xs text-gray-600">
                    {item.quantity.toFixed(2)} Units at €{item.unitPrice.toFixed(2)} / Units
                  </p>
                   {item.note && (
                    <div className="mt-1 flex items-center text-xs text-gray-500">
                      <MessageSquare size={14} className="mr-1.5 text-gray-400" />
                      <span className="truncate w-48">Note: {item.note}</span>
                       {/* TODO: Expandable on click */}
                    </div>
                  )}
                </div>
                <p className="font-bold text-gray-800 text-lg">€{calculateLineTotal(item).toFixed(2)}</p>
              </div>
               {/* Quick quantity adjust example - can be part of selected state UI */}
               {selectedItemId === item.id && (
                <div className="flex items-center space-x-2 mt-2">
                    <Button variant="outline" size="icon" className="h-7 w-7"><MinusCircle size={16} /></Button>
                    <Input type="number" value={item.quantity} readOnly className="h-7 w-12 text-center px-1"/>
                    <Button variant="outline" size="icon" className="h-7 w-7"><PlusCircle size={16} /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500"><Delete size={16}/></Button>
                </div>
               )}
            </div>
          ))
        )}
      </ScrollArea>

      {/* Order Total Section */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xl font-semibold text-gray-800">Total:</span>
          <span className="text-3xl font-bold" style={{ color: primaryOrange }}>
            €{calculateOrderTotal().toFixed(2)}
          </span>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 border-t border-gray-200">
        {/* Note: text-primary-orange and border-primary-orange are custom classes from globals.css */}
        {/* hover:bg-primary-orange-light is also a custom class */}
        {['Customer Note', 'Refund', 'Split Bill', 'Print Bill'].map((text, idx) => {
            const icons = [<FileText size={18}/>, <Undo2 size={18}/>, <SplitSquareHorizontal size={18}/>, <Printer size={18}/>];
            return (
                <Button key={text} variant="outline" className="text-primary-orange border-primary-orange hover:bg-primary-orange-light hover:text-primary-orange flex-col h-auto py-2 text-xs sm:text-sm">
                   {icons[idx]} <span className="mt-1">{text}</span>
                </Button>
            )
        })}
      </div>

      {/* Customer Selection Area */}
      <div className="p-3 border-t border-gray-200 cursor-pointer hover:bg-gray-50" onClick={() => console.log("Customer selection clicked")}>
        <div className="flex items-center">
          <User size={20} className="mr-3" style={{color: primaryOrange}}/>
          <span className="text-gray-800 font-medium">{customerName || "Customer"}</span>
        </div>
      </div>

      {/* Numpad & Actions Area */}
      <div className="p-3 border-t border-gray-200 bg-gray-50">
        <div className="flex space-x-2">
            {/* Numpad Action Buttons */}
            <div className="flex flex-col space-y-1 w-1/4">
                {['Qty', '% Disc', 'Price'].map((action) => (
                <Button
                    key={action}
                    variant={activeNumpadAction === action ? "default" : "outline"}
                    onClick={() => {setActiveNumpadAction(action as NumpadAction); setNumpadInput("");}}
                    className={`w-full justify-start text-sm py-2.5 ${activeNumpadAction === action ? 'bg-primary-orange text-white' : 'text-primary-orange border-primary-orange hover:bg-primary-orange-light'}`}
                >
                    {action}
                </Button>
                ))}
            </div>
            {/* Numpad Input Display & Keys */}
            <div className="flex-grow w-3/4">
                <Input
                    type="text"
                    readOnly
                    value={numpadInput || (activeNumpadAction ? "0.00" : "")}
                    placeholder={activeNumpadAction ? "Enter " + activeNumpadAction.toLowerCase() : "Select action"}
                    className="h-10 mb-1 text-right text-lg font-medium border-gray-300"
                />
                <div className="grid grid-cols-3 gap-1">
                    {numpadKeys.map(key => (
                        <Button
                            key={key}
                            variant="outline"
                            className="h-10 text-lg bg-white border-gray-300 hover:bg-gray-100"
                            onClick={() => handleNumpadKeyPress(key)}
                        >
                            {key === "⌫" ? <Delete size={20}/> : key}
                        </Button>
                    ))}
                </div>
            </div>
        </div>
      </div>

      {/* Payment Button */}
      <div className="p-3 border-t border-gray-200">
        <Button className="w-full h-14 text-lg font-semibold bg-primary-orange text-white hover:bg-primary-orange/90">
          Payment
        </Button>
      </div>
    </div>
  );
}
