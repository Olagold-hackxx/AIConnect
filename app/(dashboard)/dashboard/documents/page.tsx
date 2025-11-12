"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { FileText, Upload, Trash2, Download, CheckCircle2, AlertCircle, Plus, X, Image as ImageIcon, File } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"

interface Document {
  id: string
  filename: string
  file_type: string
  file_size: number
  status: string
  created_at: string
  meta_data?: {
    document_category?: string
    required_type?: string
  }
}

interface RequiredDocumentType {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  acceptedTypes: string[]
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i]
}

function getFileIcon(file: File) {
  if (file.type.startsWith("image/")) return ImageIcon
  if (file.type.includes("pdf")) return FileText
  return File
}

const REQUIRED_DOCUMENT_TYPES: RequiredDocumentType[] = [
  {
    id: "company_overview",
    name: "Company Overview",
    description: "Document describing your company, mission, vision, and values",
    icon: FileText,
    acceptedTypes: ["pdf", "docx", "txt", "md"],
  },
  {
    id: "brand_guidelines",
    name: "Brand Guidelines",
    description: "Your brand voice, tone, style guide, and visual identity",
    icon: FileText,
    acceptedTypes: ["pdf", "docx", "md"],
  },
  {
    id: "product_catalog",
    name: "Product/Service Catalog",
    description: "Information about your products or services",
    icon: FileText,
    acceptedTypes: ["pdf", "docx", "txt", "md"],
  },
  {
    id: "target_audience",
    name: "Target Audience Profile",
    description: "Details about your ideal customers and target market",
    icon: FileText,
    acceptedTypes: ["pdf", "docx", "txt", "md"],
  },
]

interface SelectedFile {
  file: File
  id: string
  preview?: string
}

export default function DocumentsPage() {
  const { toast } = useToast()
  const [documents, setDocuments] = useState<Document[]>([])
  const [selectedAssistant, setSelectedAssistant] = useState<string>("all")
  const [uploadingType, setUploadingType] = useState<string | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const requiredFileInputRef = useRef<HTMLInputElement>(null)
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const loadDocuments = useCallback(async () => {
    try {
      const assistantId = selectedAssistant === "all" ? undefined : selectedAssistant
      const response = await apiClient.listDocuments(assistantId) as { documents?: Document[] }
      setDocuments(response.documents || [])
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to load documents"
      // Only show toast for user-initiated loads, not polling
      if (!pollIntervalRef.current) {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      }
    }
  }, [selectedAssistant, toast])

  useEffect(() => {
    loadDocuments()
  }, [loadDocuments])

  // Poll for document status updates when documents are processing
  useEffect(() => {
    // Check if there are any documents that are pending or processing
    const hasProcessingDocuments = documents.some(
      (doc) => doc.status === "pending" || doc.status === "processing"
    )

    // Cleanup any existing interval
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
      pollIntervalRef.current = null
    }

    if (hasProcessingDocuments) {
      // Start polling every 2 seconds
      pollIntervalRef.current = setInterval(() => {
        loadDocuments()
      }, 2000)
      
      // Also poll immediately to catch quick status changes
      loadDocuments()
    }

    // Cleanup interval on unmount or when dependencies change
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
        pollIntervalRef.current = null
      }
    }
  }, [documents, selectedAssistant, loadDocuments])

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      for (const f of selectedFiles) {
        if (f.preview) {
          URL.revokeObjectURL(f.preview)
        }
      }
    }
  }, [selectedFiles])

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>, requiredType?: string) {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    // Allowed file types
    const allowedTypes = new Set(['text/plain', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'])
    const allowedExtensions = new Set(['.txt', '.md', '.markdown', '.pdf', '.docx', '.doc'])
    
    // Filter files to only allow txt, md, pdf, docx
    const validFiles = files.filter((file) => {
      const extension = '.' + file.name.split('.').pop()?.toLowerCase()
      const isValidType = allowedTypes.has(file.type) || allowedExtensions.has(extension)
      
      if (!isValidType) {
        toast({
          title: "Invalid File Type",
          description: `${file.name} is not allowed. Only TXT, MD, PDF, and DOCX files are supported.`,
          variant: "destructive",
        })
      }
      
      return isValidType
    })

    if (validFiles.length === 0) {
      return
    }

    const newFiles: SelectedFile[] = validFiles.map((file) => {
      const id = `${Date.now()}-${Math.random()}`
      let preview: string | undefined

      // Create preview for images
      if (file.type.startsWith("image/")) {
        preview = URL.createObjectURL(file)
      }

      return { file, id, preview }
    })

    if (requiredType) {
      // For required documents, replace existing selection
      setSelectedFiles(newFiles)
      setUploadingType(requiredType)
    } else {
      // For optional documents, add to existing selection
      setSelectedFiles((prev) => [...prev, ...newFiles])
    }

    // Reset file input
    if (event.target) {
      event.target.value = ""
    }
  }

  function removeSelectedFile(fileId: string) {
    setSelectedFiles((prev) => {
      const file = prev.find((f) => f.id === fileId)
      if (file?.preview) {
        URL.revokeObjectURL(file.preview)
      }
      return prev.filter((f) => f.id !== fileId)
    })
  }

  function clearSelectedFiles() {
    for (const f of selectedFiles) {
      if (f.preview) {
        URL.revokeObjectURL(f.preview)
      }
    }
    setSelectedFiles([])
    setUploadingType(null)
  }

  async function handleUpload(requiredType?: string) {
    if (selectedFiles.length === 0) return

    setUploading(true)
    try {
      const assistantId = selectedAssistant === "all" ? undefined : selectedAssistant
      
      // Upload all selected files
      for (const selectedFile of selectedFiles) {
        await apiClient.uploadDocument(selectedFile.file, assistantId, requiredType || uploadingType || undefined)
      }

      toast({
        title: "Success",
        description: `${selectedFiles.length} document(s) uploaded successfully`,
      })
      
      clearSelectedFiles()
      // Reload documents immediately and start polling if needed
      await loadDocuments()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload document(s)",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  function handleRequiredUpload(requiredType: string) {
    setUploadingType(requiredType)
    clearSelectedFiles()
    requiredFileInputRef.current?.click()
  }


  async function handleDelete(documentId: string) {
    if (!confirm("Are you sure you want to delete this document?")) return

    try {
      await apiClient.deleteDocument(documentId)
      
      // Optimistically remove from UI immediately
      setDocuments((prev) => prev.filter((doc) => doc.id !== documentId))
      
      toast({
        title: "Success",
        description: "Document deleted",
      })
      
      // Reload to ensure consistency with backend
      await loadDocuments()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete document",
        variant: "destructive",
      })
      // Reload on error to ensure UI is in sync
      await loadDocuments()
    }
  }

  async function handleDownload(documentId: string) {
    try {
      const response = await apiClient.getDocumentDownloadUrl(documentId) as { url?: string }
      if (response.url) {
        window.open(response.url, "_blank")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to get download URL",
        variant: "destructive",
      })
    }
  }


  // Separate documents into required and optional
  const requiredDocuments = documents.filter(
    (doc) => doc.meta_data?.document_category === "required" || doc.meta_data?.required_type
  )
  const optionalDocuments = documents.filter(
    (doc) => doc.meta_data?.document_category !== "required" && !doc.meta_data?.required_type
  )

  // Track which required document types have been uploaded
  const uploadedRequiredTypes = new Set(
    requiredDocuments
      .map((doc) => doc.meta_data?.required_type)
      .filter((type): type is string => !!type)
  )

  const requiredProgress = (uploadedRequiredTypes.size / REQUIRED_DOCUMENT_TYPES.length) * 100
  const allRequiredUploaded = uploadedRequiredTypes.size === REQUIRED_DOCUMENT_TYPES.length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Documents</h1>
          <p className="text-muted-foreground">Upload and manage your documents</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedAssistant} onValueChange={setSelectedAssistant}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All assistants" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All assistants</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => fileInputRef.current?.click()}>
            <Plus className="h-4 w-4 mr-2" />
            Select Files
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            multiple
            accept=".txt,.md,.markdown,.pdf,.docx,.doc"
            onChange={(e) => handleFileSelect(e)}
          />
        </div>
      </div>

      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && (
        <Card className="border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Selected Files ({selectedFiles.length})</CardTitle>
                <CardDescription>
                  Review your files before uploading. Click "Upload" to proceed.
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={clearSelectedFiles}>
                  <X className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
                <Button onClick={() => handleUpload()} disabled={uploading}>
                  {uploading ? (
                    <>
                      <Upload className="h-4 w-4 mr-2 animate-pulse" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload {selectedFiles.length} File{selectedFiles.length > 1 ? "s" : ""}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {selectedFiles.map((selectedFile) => {
                const FileIcon = getFileIcon(selectedFile.file)
                return (
                  <Card key={selectedFile.id} className="relative flex-1 min-w-[280px] max-w-[350px]">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        {selectedFile.preview ? (
                          <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border">
                            <img
                              src={selectedFile.preview}
                              alt={selectedFile.file.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 flex-shrink-0 rounded-lg border flex items-center justify-center bg-muted">
                            <FileIcon className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm truncate">{selectedFile.file.name}</h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatFileSize(selectedFile.file.size)} • {selectedFile.file.type || "Unknown type"}
                          </p>
                          {uploadingType && (
                            <p className="text-xs text-orange-600 mt-1">
                              Required: {REQUIRED_DOCUMENT_TYPES.find(t => t.id === uploadingType)?.name}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex-shrink-0"
                          onClick={() => removeSelectedFile(selectedFile.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Previously Uploaded Documents */}
      {documents.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Uploaded Documents</CardTitle>
                <CardDescription>
                  View and manage your previously uploaded documents
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {documents.map((doc) => {
                const statusClass = (() => {
                  if (doc.status === "completed") return "bg-green-100 text-green-800"
                  if (doc.status === "processing") return "bg-yellow-100 text-yellow-800"
                  if (doc.status === "failed") return "bg-red-100 text-red-800"
                  return "bg-gray-100 text-gray-800"
                })()
                
                return (
                  <Card key={doc.id} className="flex-1 min-w-[280px] max-w-[350px]">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <FileText className="h-5 w-5 flex-shrink-0" />
                          <CardTitle className="text-sm truncate">{doc.filename}</CardTitle>
                        </div>
                      </div>
                      <CardDescription>
                        {formatFileSize(doc.file_size)} • {doc.file_type}
                        {doc.meta_data?.required_type && (
                          <span className="ml-2 text-orange-600">
                            • {REQUIRED_DOCUMENT_TYPES.find(t => t.id === doc.meta_data?.required_type)?.name || "Required"}
                          </span>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs px-2 py-1 rounded ${statusClass}`}>
                          {doc.status}
                        </span>
                        <div className="flex gap-2">
                          {doc.status === "completed" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownload(doc.id)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(doc.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Uploaded: {new Date(doc.created_at).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Required Documents Section - Only show if not all are uploaded */}
      {!allRequiredUploaded && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Required Documents</CardTitle>
                <CardDescription>
                  Upload these documents to help the AI understand your company better
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">
                  {uploadedRequiredTypes.size}/{REQUIRED_DOCUMENT_TYPES.length}
                </div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
            </div>
            <div className="mt-4">
              <Progress value={requiredProgress} className="h-2" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {REQUIRED_DOCUMENT_TYPES.map((docType) => {
                const isUploaded = uploadedRequiredTypes.has(docType.id)
                const uploadedDoc = requiredDocuments.find(
                  (doc) => doc.meta_data?.required_type === docType.id
                )
                const DocIcon = docType.icon

                return (
                  <Card
                    key={docType.id}
                    className={`border-2 ${
                      isUploaded
                        ? "border-green-200 bg-green-50/50"
                        : "border-dashed border-gray-300"
                    }`}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <DocIcon className="h-5 w-5 mt-0.5" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-sm">{docType.name}</h3>
                              {isUploaded && (
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {docType.description}
                            </p>
                            {uploadedDoc && (
                              <div className="mt-2 text-xs text-muted-foreground">
                                Uploaded: {uploadedDoc.filename}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4">
                        {isUploaded ? (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRequiredUpload(docType.id)}
                            >
                              Replace
                            </Button>
                            {uploadedDoc && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDownload(uploadedDoc.id)}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(uploadedDoc.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleRequiredUpload(docType.id)}
                            className="w-full"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Select {docType.name}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Optional Documents Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Additional Documents</CardTitle>
              <CardDescription>
                {allRequiredUploaded
                  ? "Upload additional documents to provide more context to the AI"
                  : "Complete required documents first to unlock additional uploads"}
              </CardDescription>
            </div>
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={!allRequiredUploaded}
            >
              <Plus className="h-4 w-4 mr-2" />
              Select Files
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {(() => {
            if (!allRequiredUploaded) {
              return (
                <div className="flex items-center gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <p className="text-sm text-yellow-800">
                    Please complete all required documents before uploading additional files.
                  </p>
                </div>
              )
            }
            
            if (optionalDocuments.length === 0) {
              return (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-2">No additional documents yet</p>
                  <p className="text-xs text-muted-foreground">
                    Upload documents like case studies, testimonials, or detailed product information
                  </p>
                </div>
              )
            }
            
            return (
              <div className="flex flex-wrap gap-4">
                {optionalDocuments.map((doc) => {
                  const statusClass = (() => {
                    if (doc.status === "completed") return "bg-green-100 text-green-800"
                    if (doc.status === "processing") return "bg-yellow-100 text-yellow-800"
                    if (doc.status === "failed") return "bg-red-100 text-red-800"
                    return "bg-gray-100 text-gray-800"
                  })()
                  
                  return (
                    <Card key={doc.id} className="flex-1 min-w-[280px] max-w-[350px]">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            <CardTitle className="text-sm">{doc.filename}</CardTitle>
                          </div>
                        </div>
                        <CardDescription>
                          {formatFileSize(doc.file_size)} • {doc.file_type}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <span className={`text-xs px-2 py-1 rounded ${statusClass}`}>
                            {doc.status}
                          </span>
                          <div className="flex gap-2">
                            {doc.status === "completed" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownload(doc.id)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(doc.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )
          })()}
        </CardContent>
      </Card>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        multiple
        onChange={(e) => handleFileSelect(e)}
      />
      <input
        ref={requiredFileInputRef}
        type="file"
        className="hidden"
        accept=".txt,.md,.markdown,.pdf,.docx,.doc"
        onChange={(e) => handleFileSelect(e, uploadingType || undefined)}
      />
    </div>
  )
}

