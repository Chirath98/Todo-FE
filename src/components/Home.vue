<script setup>
import { ref, onMounted, computed } from 'vue'

const API_BASE = 'https://localhost:44313/api/Todos'

const title = ref('')
const description = ref('')
const successMessage = ref('')
const loading = ref(false)

const tasks = ref([])
const pendingTasks = computed(() => tasks.value.filter(t => {
  const status = String(t.status).toLowerCase()
  return status === 'pending'
}))

const fetchTodos = async () => {
  loading.value = true
  try {
    const res = await fetch(API_BASE, { method: 'GET' })
    const data = await res.json()
    if (Array.isArray(data)) {
      tasks.value = data.map(x => ({
        id: x.id ?? x.todoId,
        title: x.title,
        description: x.description,
        status: x.status,
        atTime: x.atTime,
        done: String(x.status).toLowerCase() === 'completed'
      }))
    }
    else if (data && data.isSuccess && Array.isArray(data.value)) {
      tasks.value = data.value.map(x => ({
        id: x.id ?? x.todoId,
        title: x.title,
        description: x.description,
        status: x.status,
        atTime: x.atTime,
        done: String(x.status).toLowerCase() === 'completed'
      }))
    }
  } catch (e) {
  } finally {
    loading.value = false
  }
}

const addTask = async () => {
  const t = title.value.trim()
  const d = description.value.trim()
  if (!t || !d) return
  try {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: t,
        description: d,
        status: 'pending',
        atTime: new Date().toISOString()
      })
    })
    const data = await res.json()
    if (data && data.isSuccess) {
      successMessage.value = 'Task created successfully.'
      title.value = ''
      description.value = ''
      await fetchTodos()
      setTimeout(() => (successMessage.value = ''), 2500)
    }
  } catch (e) {
  }
}

const markDone = async (task) => {
  try {
    const taskId = task.id ?? task.todoId
    if (taskId === undefined || taskId === null) {
      return
    }
    const res = await fetch(`${API_BASE}/${taskId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'completed' })
    })
    const data = await res.json()
    if (data && data.isSuccess) {
      successMessage.value = data.useMessage || 'Status updated successfully.'
      tasks.value = tasks.value.map(t => t.id === task.id ? { ...t, status: 'completed', done: true } : t)
      setTimeout(() => (successMessage.value = ''), 2000)
    }
  } catch (e) {
  }
}

onMounted(fetchTodos)
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="mx-auto max-w-6xl rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
      <div class="grid grid-cols-1 gap-6 md:grid-cols-[1fr,1px,2fr]">
        <div class="space-y-3">
          <h2 class="text-lg font-semibold text-gray-900">Add a Task</h2>
          <div v-if="successMessage" class="rounded-md bg-green-50 p-3 text-sm text-green-700 ring-1 ring-green-200">
            {{ successMessage }}
          </div>
          <input class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-slate-400"
            type="text" placeholder="Title" v-model="title" />
          <textarea
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-slate-400"
            rows="4" placeholder="Description" v-model="description" />
          <button
            class="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
            :disabled="!title.trim() || !description.trim()" @click="addTask">
            Add
          </button>
        </div>

        <div class="hidden h-full w-px bg-gray-200 md:block" />

        <div class="flex flex-col gap-3">
          <div v-if="loading" class="text-sm text-gray-500">Loading...</div>
          <div v-for="task in pendingTasks" :key="task.id || task.todoId"
            class="flex items-center justify-between gap-4 rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-gray-200"
            :class="task.done ? 'opacity-75' : ''">
            <div class="flex flex-col">
              <div class="text-base font-bold text-gray-900">{{ task.title }}</div>
              <div class="mt-0.5 text-sm text-gray-600">{{ task.description }}</div>
            </div>
            <button
              class="min-w-[72px] rounded-lg border border-gray-300 bg-gray-100 px-3 py-1.5 text-sm text-gray-900 hover:bg-gray-200 disabled:cursor-default disabled:opacity-70"
              :disabled="task.done" @click="markDone(task)">
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
