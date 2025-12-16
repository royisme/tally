<template>
    <Dialog v-model:open="showModal">
        <DialogContent class="sm:max-w-[600px]" @pointer-down-outside="handleOutsideClick"
            @escape-key-down="handleEscapeKey" :show-close-button="!isMandatory">
            <DialogHeader>
                <div class="flex items-center justify-between">
                    <DialogTitle>Update Available</DialogTitle>
                    <Badge variant="secondary"
                        class="bg-green-100 text-green-800 hover:bg-green-100/80 dark:bg-green-900/30 dark:text-green-400">
                        {{ updateInfo?.version }}
                    </Badge>
                </div>
            </DialogHeader>

            <div v-if="status === 'error'" class="mb-4 text-red-500">
                Error: {{ state.error }}
            </div>

            <div v-if="updateInfo">
                <!-- Release Notes View -->
                <div v-if="status === 'available'">
                    <div class="mb-4 text-gray-400 text-sm">
                        Released on {{ formatDate(updateInfo.releaseDate) }}
                    </div>

                    <div class="release-notes bg-muted/50 p-4 rounded-md mb-6 border">
                        <div class="prose prose-invert prose-sm max-w-none">
                            <pre
                                class="whitespace-pre-wrap font-sans text-muted-foreground">{{ updateInfo.releaseNotes }}</pre>
                        </div>
                    </div>
                </div>

                <!-- Downloading View -->
                <div v-if="status === 'downloading'" class="py-8 text-center">
                    <div class="mb-4 text-lg font-medium">Downloading Update...</div>
                    <Progress :model-value="downloadPercentage" class="h-2" />
                    <div class="mt-2 text-muted-foreground text-sm">
                        {{ formatBytes(progress.current) }} / {{ formatBytes(progress.total) }}
                    </div>
                </div>

                <!-- Ready View -->
                <div v-if="status === 'ready'" class="py-6 text-center">
                    <div class="text-xl text-green-500 mb-2 font-medium">Download Complete!</div>
                    <p class="text-muted-foreground mb-6">The update is ready to be installed.</p>
                    <div class="text-sm bg-muted p-4 rounded-md text-left mb-4 border">
                        <p class="font-bold mb-2">Installation Instructions:</p>
                        <ol class="list-decimal list-inside space-y-1 text-muted-foreground">
                            <li>Click "Install Update" below to open the disk image.</li>
                            <li>Drag the application to your Applications folder.</li>
                            <li>Restart the application.</li>
                        </ol>
                    </div>
                </div>

                <!-- Actions -->
                <DialogFooter>
                    <div class="flex justify-end gap-3 w-full">
                        <template v-if="status === 'available' || status === 'error'">
                            <Button v-if="!isMandatory || status === 'error'" @click="handleSkip" variant="ghost">
                                {{ status === 'error' ? 'Close' : 'Skip This Version' }}
                            </Button>
                            <Button v-if="status !== 'error'" @click="handleDownload">
                                Download Update
                            </Button>
                        </template>

                        <template v-if="status === 'downloading'">
                            <Button @click="handleCancel" variant="destructive" variant-type="outline">
                                Cancel
                            </Button>
                        </template>

                        <template v-if="status === 'ready'">
                            <Button @click="handleSkip" variant="ghost">
                                Close
                            </Button>
                            <Button @click="handleInstall">
                                Install Update
                            </Button>
                        </template>
                    </div>
                </DialogFooter>
            </div>
        </DialogContent>
    </Dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUpdateStore } from '@/stores/update'
import { storeToRefs } from 'pinia'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

const store = useUpdateStore()
const { state, progress } = storeToRefs(store)

const status = computed(() => state.value.status)
const updateInfo = computed(() => state.value.updateInfo)
const isMandatory = computed(() => updateInfo.value?.mandatory || false)

const showModal = computed({
    get: () => ['available', 'downloading', 'ready', 'error'].includes(status.value),
    set: (val) => {
        if (!val && !handleAttemptClose()) {
            // If strictly closing via v-model (rare with our prevents), try to skip
            // but handleAttemptClose logic should usually catch events first
        }
    }
})

const downloadPercentage = computed(() => {
    if (progress.value.total > 0) {
        return Math.floor((progress.value.current / progress.value.total) * 100)
    }
    return 0
})

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString()
}

function formatBytes(bytes: number) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function handleAttemptClose() {
    if (!isMandatory.value && status.value !== 'downloading') {
        store.skipVersion()
        return true
    }
    return false
}

function handleOutsideClick(e: Event) {
    if (!handleAttemptClose()) {
        e.preventDefault()
    }
}

function handleEscapeKey(e: KeyboardEvent) {
    if (!handleAttemptClose()) {
        e.preventDefault()
    }
}

function handleSkip() {
    store.skipVersion()
}

function handleDownload() {
    store.startDownload()
}

function handleCancel() {
    store.cancelDownload()
}

function handleInstall() {
    store.installUpdate()
}
</script>

<style scoped>
.release-notes {
    max-height: 300px;
    overflow: auto;
}
</style>
