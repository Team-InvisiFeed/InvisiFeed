"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Minus, Save, X } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// Form Schema
const formSchema = z.object({
  // Business Details
  businessName: z.string().min(1, "Business name is required"),
  businessEmail: z.string().email("Invalid email address"),
  businessPhone: z.string().optional(),
  businessAddress: z.string().min(1, "Business address is required"),
  gstin: z.string().optional(),

  // Customer Details
  customerName: z.string().min(1, "Customer name is required"),
  customerEmail: z.string().email("Invalid email address"),
  customerPhone: z.string().optional(),
  customerAddress: z.string().min(1, "Customer address is required"),

  // Invoice Meta Details
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  invoiceDate: z.string().min(1, "Invoice date is required"),
  dueDate: z.string().optional(),
  paymentTerms: z.string(),

  // Services/Items
  items: z.array(z.object({
    description: z.string().min(1, "Description is required"),
    quantity: z.number().min(1, "Quantity must be at least 1"),
    rate: z.number().min(0, "Rate must be 0 or greater"),
    amount: z.number(),
    discount: z.number().min(0).max(100),
    tax: z.number().min(0).max(100),
  })).min(1, "At least one item is required"),

  // Payment Info
  bankDetails: z.string().optional(),
  paymentMethod: z.string(),
  paymentInstructions: z.string().optional(),

  // Notes
  notes: z.string().optional(),

  // Add-ons
  includeFeedbackForm: z.boolean(),
  addCoupon: z.boolean(),
  coupon: z.object({
    code: z.string().optional(),
    description: z.string().optional(),
    expiryDays: z.string().optional(),
  }).optional(),
});

export default function CreateInvoiceForm({ onSave, onCancel }) {
  const { data: session } = useSession();
  const owner = session?.user;

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessName: owner?.organizationName || "",
      businessEmail: owner?.email || "",
      businessPhone: owner?.phoneNumber || "",
      businessAddress: owner?.address ? 
        `${owner.address.localAddress || ""} ${owner.address.city || ""} ${owner.address.state || ""} ${owner.address.country || ""} ${owner.address.pincode || ""}`.trim() : "",
      gstin: owner?.gstin || "",
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      customerAddress: "",
      invoiceNumber: "",
      invoiceDate: new Date().toISOString().split("T")[0],
      dueDate: "",
      paymentTerms: "Net 7",
      items: [
        {
          description: "",
          quantity: 1,
          rate: 0,
          amount: 0,
          discount: 0,
          tax: 0,
        },
      ],
      bankDetails: "",
      paymentMethod: "Bank Transfer",
      paymentInstructions: "",
      notes: "",
      includeFeedbackForm: false,
      addCoupon: false,
      coupon: {
        code: "",
        description: "",
        expiryDays: "30",
      },
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const [subtotal, setSubtotal] = useState(0);
  const [taxTotal, setTaxTotal] = useState(0);
  const [discountTotal, setDiscountTotal] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);

  const calculateTotals = (items) => {
    let sub = 0;
    let tax = 0;
    let discount = 0;

    items.forEach((item) => {
      const itemAmount = item.quantity * item.rate;
      const itemDiscount = (itemAmount * item.discount) / 100;
      const itemAfterDiscount = itemAmount - itemDiscount;
      const itemTax = (itemAfterDiscount * item.tax) / 100;

      sub += itemAmount;
      discount += itemDiscount;
      tax += itemTax;
    });

    setSubtotal(sub);
    setTaxTotal(tax);
    setDiscountTotal(discount);
    setGrandTotal(sub - discount + tax);
  };

  const onSubmit = (data) => {
    if (!data.businessName || !data.customerName) {
      toast.error("Please fill in all required fields");
      return;
    }
    onSave(data);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto bg-[#1A1A1A] rounded-xl p-6 border border-yellow-400/20"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Business Details */}
          <Card className="bg-[#0A0A0A] border-yellow-400/20">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold text-yellow-400 mb-4">Business Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="businessName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Business Name *</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-[#0A0A0A] text-white border-yellow-400/20" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="businessEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Business Email *</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" className="bg-[#0A0A0A] text-white border-yellow-400/20" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="businessPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Business Phone</FormLabel>
                      <FormControl>
                        <Input {...field} type="tel" className="bg-[#0A0A0A] text-white border-yellow-400/20" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gstin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">GSTIN / Tax ID</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-[#0A0A0A] text-white border-yellow-400/20" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="businessAddress"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="text-gray-300">Business Address *</FormLabel>
                      <FormControl>
                        <Textarea {...field} className="bg-[#0A0A0A] text-white border-yellow-400/20" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Customer Details */}
          <Card className="bg-[#0A0A0A] border-yellow-400/20">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold text-yellow-400 mb-4">Customer Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Customer Name *</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-[#0A0A0A] text-white border-yellow-400/20" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="customerEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Customer Email *</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" className="bg-[#0A0A0A] text-white border-yellow-400/20" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="customerPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Customer Phone</FormLabel>
                      <FormControl>
                        <Input {...field} type="tel" className="bg-[#0A0A0A] text-white border-yellow-400/20" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="customerAddress"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="text-gray-300">Customer Address *</FormLabel>
                      <FormControl>
                        <Textarea {...field} className="bg-[#0A0A0A] text-white border-yellow-400/20" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Invoice Meta Details */}
          <Card className="bg-[#0A0A0A] border-yellow-400/20">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold text-yellow-400 mb-4">Invoice Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="invoiceNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Invoice Number *</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-[#0A0A0A] text-white border-yellow-400/20" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="invoiceDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Invoice Date *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            {...field} 
                            type="date" 
                            className="bg-[#0A0A0A] text-white border-yellow-400/20 pr-10 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer" 
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Due Date</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            {...field} 
                            type="date" 
                            className="bg-[#0A0A0A] text-white border-yellow-400/20 pr-10 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer" 
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="paymentTerms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Payment Terms</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-[#0A0A0A] border-yellow-400/20">
                            <SelectValue placeholder="Select payment terms" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Net 7">Net 7</SelectItem>
                          <SelectItem value="Net 15">Net 15</SelectItem>
                          <SelectItem value="Net 30">Net 30</SelectItem>
                          <SelectItem value="Due on receipt">Due on receipt</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Services/Items */}
          <Card className="bg-[#0A0A0A] border-yellow-400/20">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-yellow-400">Services/Items</h3>
                <Button
                  type="button"
                  onClick={() => append({
                    description: "",
                    quantity: 1,
                    rate: 0,
                    amount: 0,
                    discount: 0,
                    tax: 0,
                  })}
                  className="bg-yellow-400 text-gray-900 hover:bg-yellow-500"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </div>
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <Card key={field.id} className="bg-[#0A0A0A] border-yellow-400/20">
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                        <FormField
                          control={form.control}
                          name={`items.${index}.description`}
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel className="text-gray-300">Description *</FormLabel>
                              <FormControl>
                                <Input {...field} className="bg-[#0A0A0A] text-white border-yellow-400/20" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`items.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-300">Quantity *</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="number"
                                  min="1"
                                  className="bg-[#0A0A0A] text-white border-yellow-400/20"
                                  onChange={(e) => {
                                    field.onChange(Number(e.target.value));
                                    calculateTotals(form.getValues("items"));
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`items.${index}.rate`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-300">Rate *</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="number"
                                  min="0"
                                  className="bg-[#0A0A0A] text-white border-yellow-400/20"
                                  onChange={(e) => {
                                    field.onChange(Number(e.target.value));
                                    calculateTotals(form.getValues("items"));
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`items.${index}.discount`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-300">Discount (%)</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="number"
                                  min="0"
                                  max="100"
                                  className="bg-[#0A0A0A] text-white border-yellow-400/20"
                                  onChange={(e) => {
                                    field.onChange(Number(e.target.value));
                                    calculateTotals(form.getValues("items"));
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`items.${index}.tax`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-300">Tax (%)</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="number"
                                  min="0"
                                  max="100"
                                  className="bg-[#0A0A0A] text-white border-yellow-400/20"
                                  onChange={(e) => {
                                    field.onChange(Number(e.target.value));
                                    calculateTotals(form.getValues("items"));
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex items-end">
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => remove(index)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Minus className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card className="bg-[#0A0A0A] border-yellow-400/20">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold text-yellow-400 mb-4">Payment Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="bankDetails"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="text-gray-300">Bank Account Details / UPI ID</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-[#0A0A0A] text-white border-yellow-400/20" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Payment Method</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-[#0A0A0A] border-yellow-400/20">
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                          <SelectItem value="UPI">UPI</SelectItem>
                          <SelectItem value="PayPal">PayPal</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="paymentInstructions"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="text-gray-300">Payment Instructions</FormLabel>
                      <FormControl>
                        <Textarea {...field} className="bg-[#0A0A0A] text-white border-yellow-400/20" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="bg-[#0A0A0A] border-yellow-400/20">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold text-yellow-400 mb-4">Additional Notes</h3>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        {...field}
                        className="bg-[#0A0A0A] text-white border-yellow-400/20"
                        placeholder="Add any additional notes for your client..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Add-ons */}
          <Card className="bg-[#0A0A0A] border-yellow-400/20">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold text-yellow-400 mb-4">Add-ons</h3>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="includeFeedbackForm"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="border-yellow-400/20 data-[state=checked]:bg-yellow-400 data-[state=checked]:text-gray-900"
                        />
                      </FormControl>
                      <FormLabel className="text-gray-300">
                        Include Feedback Form in Invoice PDF
                      </FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="addCoupon"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="border-yellow-400/20 data-[state=checked]:bg-yellow-400 data-[state=checked]:text-gray-900"
                        />
                      </FormControl>
                      <FormLabel className="text-gray-300">
                        Add Coupon for Customer
                      </FormLabel>
                    </FormItem>
                  )}
                />
                {form.watch("addCoupon") && (
                  <Card className="bg-[#0A0A0A] border-yellow-400/20">
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="coupon.code"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-300">Coupon Code</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  className="bg-[#0A0A0A] text-white border-yellow-400/20"
                                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                                  placeholder="Enter coupon code"
                                />
                              </FormControl>
                              <FormMessage />
                              <p className="text-xs text-gray-400 mt-1">
                                This coupon code will go under slight modification for security purposes
                              </p>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="coupon.description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-300">Description</FormLabel>
                              <FormControl>
                                <Textarea
                                  {...field}
                                  className="bg-[#0A0A0A] text-white border-yellow-400/20"
                                  placeholder="Enter coupon description"
                                  rows="3"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="coupon.expiryDays"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-300">Expiry (in days)</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="number"
                                  min="1"
                                  className="bg-[#0A0A0A] text-white border-yellow-400/20"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Totals */}
          <Card className="bg-[#0A0A0A] border-yellow-400/20">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal:</span>
                  <span>{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Discount:</span>
                  <span>-{discountTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Tax:</span>
                  <span>{taxTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold text-yellow-400">
                  <span>Grand Total:</span>
                  <span>{grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              className="text-gray-300 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-yellow-400 text-gray-900 hover:bg-yellow-500"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Invoice
            </Button>
          </div>
        </form>
      </Form>
    </motion.div>
  );
} 