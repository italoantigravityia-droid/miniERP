"use client";

import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Plus, Edit, Trash2 } from "lucide-react";
import { createCustomer, updateCustomer, deleteCustomer } from "@/actions/customer";
import { searchCities } from "@/actions/city";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { formatCpfCnpj, formatPhone } from "@/lib/formatters";
import { Search } from "lucide-react";

const customerSchema = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  documento: z.string().min(11, "Documento inválido"),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  telefone: z.string().optional().or(z.literal("")),
  cidade_id: z.number({ required_error: "Selecione uma cidade" }),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

export function ClientPage({ initialCustomers }: { initialCustomers: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors }, setValue, watch, control } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: { nome: "", documento: "", email: "", telefone: "", cidade_id: undefined }
  });

  const [citySearch, setCitySearch] = useState("");
  const [cityResults, setCityResults] = useState<any[]>([]);
  const [selectedCityName, setSelectedCityName] = useState("");
  const [isSearchingCities, setIsSearchingCities] = useState(false);

  const handleCitySearch = async (val: string) => {
    setCitySearch(val);
    if (val.length < 2) {
      setCityResults([]);
      return;
    }
    setIsSearchingCities(true);
    const res = await searchCities(val);
    if (res.success) {
      setCityResults(res.data || []);
    }
    setIsSearchingCities(false);
  };

  const openModal = (customer?: any) => {
    setErrorMsg(null);
    setCityResults([]);
    if (customer) {
      setEditingId(customer.id);
      setValue("nome", customer.nome);
      setValue("documento", customer.documento);
      setValue("email", customer.email || "");
      setValue("telefone", customer.telefone || "");
      setValue("cidade_id", customer.cidade_id);
      setSelectedCityName(`${customer.cidade.nome} - ${customer.cidade.uf}`);
      setCitySearch("");
    } else {
      setEditingId(null);
      reset();
      setSelectedCityName("");
      setCitySearch("");
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    reset();
  };

  const onSubmit = async (data: CustomerFormValues) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      let res;
      if (editingId) {
        res = await updateCustomer(editingId, data);
      } else {
        res = await createCustomer(data);
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
    if (confirm("Tem certeza que deseja excluir este cliente?")) {
      const res = await deleteCustomer(id);
      if (!res.success) {
        alert(res.error);
      }
    }
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ font: 'var(--md-sys-typescale-headline-large)', margin: 0 }}>Gestão de Clientes</h2>
        <Button onClick={() => openModal()}><Plus size={20} /> Novo Cliente</Button>
      </div>

      <Card>
        <CardContent style={{ padding: 0 }}>
          <div className="table-container">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Documento</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Cidade/UF</TableHead>
                  <TableHead style={{ width: 100 }}>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {initialCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} style={{ textAlign: "center", padding: 32 }}>
                      Nenhum cliente cadastrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  initialCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>{customer.nome}</TableCell>
                      <TableCell>{customer.documento}</TableCell>
                      <TableCell>{customer.email || "-"}</TableCell>
                      <TableCell>{customer.telefone || "-"}</TableCell>
                      <TableCell>{customer.cidade ? `${customer.cidade.nome} - ${customer.cidade.uf}` : "-"}</TableCell>
                      <TableCell>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <Button variant="text" size="sm" onClick={() => openModal(customer)}>
                            <Edit size={16} />
                          </Button>
                          <Button variant="text" size="sm" onClick={() => handleDelete(customer.id)} style={{ color: 'var(--md-sys-color-error)' }}>
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

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingId ? "Editar Cliente" : "Novo Cliente"}>
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
          {errorMsg && <div style={{ color: 'var(--md-sys-color-error)', padding: 12, backgroundColor: 'var(--md-sys-color-error-container)', borderRadius: 8 }}>{errorMsg}</div>}
          
          <Input 
            label="Nome Completo / Razão Social" 
            {...register("nome")} 
            error={errors.nome?.message}
          />
          <Input 
            label="CPF / CNPJ" 
            {...register("documento")} 
            onChange={(e) => {
              const formatted = formatCpfCnpj(e.target.value);
              setValue("documento", formatted, { shouldValidate: true });
            }}
            error={errors.documento?.message}
            maxLength={18}
          />
          <Input 
            label="E-mail" 
            type="email"
            {...register("email")} 
            error={errors.email?.message}
          />
          <Input 
            label="Telefone" 
            {...register("telefone")} 
            onChange={(e) => {
              const formatted = formatPhone(e.target.value);
              setValue("telefone", formatted, { shouldValidate: true });
            }}
            error={errors.telefone?.message}
            maxLength={15}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, position: 'relative' }}>
            <label style={{ font: 'var(--md-sys-typescale-body-medium)', color: 'var(--md-sys-color-on-surface-variant)' }}>Cidade</label>
            <div style={{ position: 'relative' }}>
              <Input
                placeholder={selectedCityName || "Buscar cidade..."}
                value={citySearch}
                onChange={(e) => handleCitySearch(e.target.value)}
                style={{ paddingLeft: selectedCityName ? '12px' : '12px' }}
              />
              {isSearchingCities && <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 12 }}>...</div>}
            </div>
            {errors.cidade_id && <span style={{ color: 'var(--md-sys-color-error)', fontSize: 12 }}>{errors.cidade_id.message as string}</span>}
            
            {cityResults.length > 0 && (
              <ul style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: 'var(--md-sys-color-surface)',
                border: '1px solid var(--md-sys-color-outline)',
                borderRadius: '4px',
                listStyle: 'none',
                padding: 0,
                margin: 0,
                zIndex: 100,
                maxHeight: '200px',
                overflowY: 'auto',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}>
                {cityResults.map((city) => (
                  <li 
                    key={city.id} 
                    onClick={() => {
                      setValue("cidade_id", city.id, { shouldValidate: true });
                      setSelectedCityName(`${city.nome} - ${city.uf}`);
                      setCityResults([]);
                      setCitySearch("");
                    }}
                    style={{
                      padding: '8px 12px',
                      cursor: 'pointer',
                      borderBottom: '1px solid var(--md-sys-color-surface-variant)'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--md-sys-color-surface-variant)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    {city.nome} - {city.uf}
                  </li>
                ))}
              </ul>
            )}
          </div>
          
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
