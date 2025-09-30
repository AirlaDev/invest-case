// frontend/src/app/dashboard/clients/page.tsx
"use client";

import { useEffect, useState } from "react";
import axios from "axios";

// Interface para tipar os dados do cliente
interface Client {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          // Lógica para redirecionar para login se não houver token
          return;
        }
        const response = await axios.get("http://localhost:8000/clients", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setClients(response.data);
      } catch (error) {
        console.error("Falha ao buscar clientes", error);
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  if (loading) {
    return <p>Carregando...</p>;
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Lista de Clientes</h1>
      {/* Aqui você adicionará inputs para busca e filtro */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-200">
            <tr>
              <th className="py-2 px-4">Nome</th>
              <th className="py-2 px-4">Email</th>
              <th className="py-2 px-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id} className="border-b">
                <td className="py-2 px-4">{client.name}</td>
                <td className="py-2 px-4">{client.email}</td>
                <td className="py-2 px-4">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      client.is_active
                        ? "bg-green-200 text-green-800"
                        : "bg-red-200 text-red-800"
                    }`}
                  >
                    {client.is_active ? "Ativo" : "Inativo"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}