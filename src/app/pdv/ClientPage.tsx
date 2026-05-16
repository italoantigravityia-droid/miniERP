"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Plus, Minus, Trash2, ShoppingCart, CheckCircle } from "lucide-react";
import { createSale } from "@/actions/sale";

export function ClientPage({ customers, products }: { customers: any[], products: any[] }) {
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | "">("");
  const [cart, setCart] = useState<{ product: any, quantity: number }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const subtotal = useMemo(() => {
    return cart.reduce((total, item) => total + (item.product.preco_unitario * item.quantity), 0);
  }, [cart]);

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.estoque) return prev; // Cannot add more than stock
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      if (product.estoque === 0) return prev;
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQuantity = item.quantity + delta;
        if (newQuantity < 1) return item;
        if (newQuantity > item.product.estoque) return item;
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const handleCheckout = async () => {
    if (!selectedCustomerId) {
      setErrorMsg("Selecione um cliente para finalizar a venda.");
      return;
    }
    if (cart.length === 0) {
      setErrorMsg("Adicione produtos ao carrinho.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const payload = {
        cliente_id: Number(selectedCustomerId),
        items: cart.map(item => ({ produto_id: item.product.id, quantidade: item.quantity }))
      };

      const res = await createSale(payload);
      if (res.success) {
        setSuccessMsg("Venda finalizada com sucesso!");
        setCart([]);
        setSelectedCustomerId("");
      } else {
        setErrorMsg(res.error || "Erro ao finalizar venda.");
      }
    } catch (e) {
      setErrorMsg("Erro de conexão.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pdv-layout">
      {/* Left side - Products */}
      <div className="pdv-products">
        <h2 style={{ font: 'var(--md-sys-typescale-headline-large)', margin: '0 0 16px 0' }}>Produtos</h2>
        
        <div className="pdv-products-grid">
          {products.map(product => (
            <Card key={product.id} style={{ display: 'flex', flexDirection: 'column' }}>
              <CardContent style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h4 style={{ margin: '0 0 8px 0', font: 'var(--md-sys-typescale-title-large)', fontSize: 18 }}>{product.nome}</h4>
                <p style={{ margin: 0, font: 'var(--md-sys-typescale-body-large)', color: 'var(--md-sys-color-primary)', fontWeight: 'bold' }}>
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.preco_unitario)}
                </p>
                <p style={{ margin: '4px 0 16px 0', font: 'var(--md-sys-typescale-body-medium)', color: 'var(--md-sys-color-on-surface-variant)' }}>
                  Estoque: {product.estoque} un.
                </p>
                <div style={{ marginTop: 'auto' }}>
                  <Button 
                    style={{ width: '100%' }} 
                    disabled={product.estoque === 0}
                    onClick={() => addToCart(product)}
                  >
                    Adicionar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Right side - Cart */}
      <div className="pdv-cart">
        <Card style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <CardHeader>
            <CardTitle style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShoppingCart size={24} /> Carrinho
            </CardTitle>
          </CardHeader>
          
          <CardContent style={{ padding: '0 24px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {errorMsg && <div style={{ color: 'var(--md-sys-color-error)', padding: 12, backgroundColor: 'var(--md-sys-color-error-container)', borderRadius: 8 }}>{errorMsg}</div>}
            {successMsg && <div style={{ color: 'var(--md-sys-color-primary)', padding: 12, backgroundColor: 'var(--md-sys-color-primary-container)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8 }}><CheckCircle size={20} />{successMsg}</div>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ font: 'var(--md-sys-typescale-body-medium)', color: 'var(--md-sys-color-on-surface-variant)' }}>Cliente</label>
              <select 
                value={selectedCustomerId} 
                onChange={(e) => setSelectedCustomerId(e.target.value ? Number(e.target.value) : "")}
                style={{ padding: 12, borderRadius: 8, border: '1px solid var(--md-sys-color-outline)', backgroundColor: 'var(--md-sys-color-surface)' }}
              >
                <option value="">-- Selecione o Cliente --</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.nome} ({c.documento})</option>
                ))}
              </select>
            </div>

            <div style={{ borderTop: '1px solid var(--md-sys-color-surface-variant)', margin: '8px 0' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--md-sys-color-on-surface-variant)', marginTop: 32 }}>
                  Seu carrinho está vazio.
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.product.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--md-sys-color-surface-variant)', padding: '12px 16px', borderRadius: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold' }}>{item.product.nome}</div>
                      <div style={{ fontSize: 14, color: 'var(--md-sys-color-on-surface-variant)' }}>
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.product.preco_unitario)} x {item.quantity}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button onClick={() => updateQuantity(item.product.id, -1)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}><Minus size={16} /></button>
                      <span style={{ minWidth: 20, textAlign: 'center' }}>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product.id, 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}><Plus size={16} /></button>
                      <button onClick={() => removeFromCart(item.product.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--md-sys-color-error)', marginLeft: 8, display: 'flex' }}><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>

          <CardFooter style={{ borderTop: '1px solid var(--md-sys-color-surface-variant)', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: 20, fontWeight: 'bold' }}>
              <span>Total:</span>
              <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(subtotal)}</span>
            </div>
            <Button 
              style={{ width: '100%', padding: 16, fontSize: 18 }} 
              disabled={isLoading || cart.length === 0 || !selectedCustomerId}
              onClick={handleCheckout}
            >
              {isLoading ? "Processando..." : "Finalizar Venda"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
