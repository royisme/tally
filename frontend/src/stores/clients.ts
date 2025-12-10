import { defineStore } from "pinia";
import { ref } from "vue";
import { api } from "@/api";
import type { Client, CreateClientInput, UpdateClientInput } from "@/types";

export const useClientStore = defineStore("clients", () => {
  const clients = ref<Client[]>([]);
  const loading = ref(false);

  async function fetchClients() {
    loading.value = true;
    try {
      clients.value = await api.clients.list();
    } catch (error) {
      console.error("Failed to fetch clients", error);
    } finally {
      loading.value = false;
    }
  }

  async function createClient(input: CreateClientInput) {
    loading.value = true;
    try {
      await api.clients.create(input);
      await fetchClients();
    } finally {
      loading.value = false;
    }
  }

  async function updateClient(input: UpdateClientInput) {
    loading.value = true;
    try {
      await api.clients.update(input);
      await fetchClients();
    } finally {
      loading.value = false;
    }
  }

  async function deleteClient(id: number) {
    loading.value = true;
    try {
      await api.clients.delete(id);
      await fetchClients();
    } finally {
      loading.value = false;
    }
  }

  return {
    clients,
    loading,
    fetchClients,
    createClient,
    updateClient,
    deleteClient,
  };
});
