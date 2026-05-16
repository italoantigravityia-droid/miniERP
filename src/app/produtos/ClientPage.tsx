"use client";

import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Plus, Edit, Trash2 } from "lucide-react";
import { createProduct, updateProduct, deleteProduct } from "@/actions/product";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { NumericFormat } from "react-number-format";

const productSchema = z.object({
  nome: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  preco_unitario: z.coerce.number().min(0, "O preço não pode ser negativo"),
  estoque: z.coerce.number().int("Estoque deve ser um número inteiro").min(0, "O estoque não pode ser negativo"),
});

type ProductFormValues = z.infer<typeof productSchema>;

export function ClientPage({ initialProducts }: { initialProducts: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors }, setValue, control } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: { nome: "", preco_unitario: 0, estoque: 0 }
  });

  const openModal = (product?: any) => {
    setErrorMsg(null);
    if (product) {
      setEditingId(product.id);
      setValue("nome", product.nome);
      setValue("preco_unitario", product.preco_unitario);
      setValue("estoque", product.estoque);
    } else {
      setEditingId(null);
      reset();
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    reset();
  };

  const onSubmit = async (data: ProductFormValues) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      let res;
      if (editingId) {
        res = await updateProduct(editingId, data);
      } else {
        res = await createProduct(data);
      }
      
      if (res.success) {
        closeModal();
      } else {
        setErrorMsg(res.error || "Ocorreu um erro");
      }
    } catch (e) {
      setErrorMsg("Erro de conexão");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja excluir este produto?")) {
      const res = await deleteProduct(id);
      if (!res.success) {
        alert(res.error);
      }
    }
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ font: 'var(--md-sys-typescale-headline-large)', margin: 0 }}>Gestão de Produtos</h2>
        <Button onClick={() => openModal()}><Plus size={20} /> Novo Produto</Button>
      </div>

      <Card>
        <CardContent style={{ padding: 0 }}>
          <div className="table-container">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Preço Unitário</TableHead>
                  <TableHead>Estoque</TableHead>
                  <TableHead style={{ width: 100 }}>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {initialProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} style={{ textAlign: "center", padding: 32 }}>
                      Nenhum produto cadastrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  initialProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>{product.nome}</TableCell>
                      <TableCell>
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.preco_unitario)}
                      </TableCell>
                      <TableCell>
                        <span style={{ 
                          color: product.estoque === 0 ? 'var(--md-sys-color-error)' : 'inherit',
                          fontWeight: product.estoque === 0 ? 'bold' : 'normal'
                        }}>
                          {product.estoque} un.
                        </span>
                      </TableCell>
                      <TableCell>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <Button variant="text" size="sm" onClick={() => openModal(product)}>
                            <Edit size={16} />
                          </Button>
                          <Button variant="text" size="sm" onClick={() => handleDelete(product.id)} style={{ color: 'var(--md-sys-color-error)' }}>
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingId ? "Editar Produto" : "Novo Produto"}>
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
          {errorMsg && <div style={{ color: 'var(--md-sys-color-error)', padding: 12, backgroundColor: 'var(--md-sys-color-error-container)', borderRadius: 8 }}>{errorMsg}</div>}
          
          <Input 
            label="Nome do Produto" 
            {...register("nome")} 
            error={errors.nome?.message}
          />
          
          <Controller
            name="preco_unitario"
            control={control}
            render={({ field: { onChange, value, onBlur } }) => (
              <NumericFormat
                value={value}
                onBlur={onBlur}
                customInput={Input}
                label="Preço Unitário (R$)"
                thousandSeparator="."
                decimalSeparator=","
                prefix="R$ "
                decimalScale={2}
                fixedDecimalScale
                allowNegative={false}
                onValueChange={(values) => {
                  onChange(values.floatValue ?? 0);
                }}
                error={errors.preco_unitario?.message}
              />
            )}
          />

          <Input 
            label="Quantidade em Estoque" 
            type="number"
            {...register("estoque")} 
            error={errors.estoque?.message}
          />
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
            <Button type="button" variant="outlined" onClick={closeModal}>Cancelar</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
