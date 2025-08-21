"use client";

import React, { useState, useEffect } from "react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import PageContainer from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Edit, Trash2, Eye, FileText, Loader2, RefreshCw, Calendar } from "lucide-react";
import { PrivacyModal } from "@/components/modal/privacy-modal";
import { DeletePrivacyModal } from "@/components/modal/delete-privacy-modal";
import { RichTextDisplay } from "@/components/ui/rich-text-display";
import { toast } from "@/lib/toast";
import { apiService } from "@/lib/api-service";
import { API_ENDPOINTS } from "@/constants/api-endpoints";

export interface PrivacyPolicy {
  id?: number;
  title: string;
  content: string;
  version: string;
  status: "Draft" | "Published" | "Archived";
  effectiveDate?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

interface Stats {
  total: number;
  draft: number;
  published: number;
  archived: number;
  latestVersion: string;
}

// Utility function to transform snake_case API response to camelCase
const transformPrivacyData = (apiData: any): PrivacyPolicy => {
  if (!apiData) {
    throw new Error("Invalid privacy policy data: data is null or undefined");
  }

  return {
    id: apiData.id,
    title: apiData.title || "",
    content: apiData.content || "",
    version: apiData.version || "1.0",
    status: apiData.status || "Draft",
    effectiveDate: apiData.effective_date || apiData.effectiveDate || "",
    createdAt: apiData.created_at || apiData.createdAt || "",
    updatedAt: apiData.updated_at || apiData.updatedAt || "",
    createdBy: apiData.created_by || apiData.createdBy || "",
    updatedBy: apiData.updated_by || apiData.updatedBy || "",
  };
};

export default function PrivacyPage() {
  const [privacyPolicies, setPrivacyPolicies] = useState<PrivacyPolicy[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    draft: 0,
    published: 0,
    archived: 0,
    latestVersion: "1.0",
  });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPrivacy, setSelectedPrivacy] = useState<PrivacyPolicy | null>(null);
  const [privacyToDelete, setPrivacyToDelete] = useState<PrivacyPolicy | null>(null);

  const fetchPrivacyPolicies = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter && statusFilter !== "all") params.status = statusFilter;
      const result = await apiService.get(API_ENDPOINTS.PRIVACY.BASE, { params });
      if (result.success) {
        const privacyData = Array.isArray(result.data)
          ? result.data.map(transformPrivacyData)
          : [];
        setPrivacyPolicies(privacyData);
        const statsData = {
          total: result.stats?.total || result.meta?.total || privacyData.length,
          draft: result.stats?.draft || privacyData.filter((policy: PrivacyPolicy) => policy.status === "Draft").length,
          published: result.stats?.published || privacyData.filter((policy: PrivacyPolicy) => policy.status === "Published").length,
          archived: result.stats?.archived || privacyData.filter((policy: PrivacyPolicy) => policy.status === "Archived").length,
          latestVersion:
            result.stats?.latestVersion ||
            (privacyData.length > 0
              ? Math.max(...privacyData.map((policy: PrivacyPolicy) => parseFloat(policy.version) || 1.0)).toFixed(1)
              : "1.0"),
        };
        setStats(statsData);
      } else {
        toast.error("Failed to fetch privacy policies. Please try again.");
      }
    } catch (error) {
      toast.error("Network error. Please check your connection.");
      setPrivacyPolicies([]);
      setStats({
        total: 0,
        draft: 0,
        published: 0,
        archived: 0,
        latestVersion: "1.0",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSavePrivacy = async (
    privacyData: Omit<PrivacyPolicy, "id" | "createdAt" | "updatedAt" | "createdBy" | "updatedBy">
  ) => {
    try {
      if (selectedPrivacy?.id) {
        const result = await apiService.put(API_ENDPOINTS.PRIVACY.BY_ID(selectedPrivacy.id), privacyData);
        if (result.success) {
          await fetchPrivacyPolicies();
          setIsEditModalOpen(false);
          setSelectedPrivacy(null);
          toast.success("Privacy policy updated successfully");
        } else {
          toast.error(result.error || "Failed to update privacy policy");
          throw new Error(result.error);
        }
      } else {
        const result = await apiService.post(API_ENDPOINTS.PRIVACY.BASE, privacyData);
        if (result.success) {
          await fetchPrivacyPolicies();
          setIsAddModalOpen(false);
          toast.success("Privacy policy created successfully");
        } else {
          toast.error(result.error || "Failed to create privacy policy");
          throw new Error(result.error);
        }
      }
    } catch (error) {
      throw error;
    }
  };

  const handleDeletePrivacy = async () => {
    if (!privacyToDelete?.id) return;
    try {
      const result = await apiService.delete(API_ENDPOINTS.PRIVACY.BY_ID(privacyToDelete.id));
      if (result.success) {
        await fetchPrivacyPolicies();
        setIsDeleteModalOpen(false);
        setPrivacyToDelete(null);
        toast.success("Privacy policy deleted successfully");
      } else {
        toast.error(result.error || "Failed to delete privacy policy");
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    }
  };

  const handlePublishPrivacy = async (privacyId: number) => {
    try {
      const result = await apiService.post(API_ENDPOINTS.PRIVACY.PUBLISH(privacyId), {
        effectiveDate: new Date().toISOString().split("T")[0],
      });
      if (result.success) {
        await fetchPrivacyPolicies();
        toast.success("Privacy policy published successfully");
      } else {
        toast.error(result.error || "Failed to publish privacy policy");
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    }
  };

  useEffect(() => {
    fetchPrivacyPolicies();
  }, [searchTerm, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Published":
        return "bg-green-100 text-green-800";
      case "Draft":
        return "bg-yellow-100 text-yellow-800";
      case "Archived":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <PageContainer>
      <div className="space-y-4">
        <Breadcrumbs />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Privacy Policy Management</h1>
            <p className="text-muted-foreground">
              Create, edit, and manage your platform's privacy policies
            </p>
          </div>
          <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Privacy Policy
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-yellow-500 rounded-full" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Draft</p>
                  <p className="text-2xl font-bold">{stats.draft}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-green-500 rounded-full" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Published</p>
                  <p className="text-2xl font-bold">{stats.published}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Latest Version</p>
                  <p className="text-2xl font-bold">{stats.latestVersion}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Privacy Policy Management</CardTitle>
                <CardDescription>
                  Create, edit, and manage your platform&apos;s privacy policies
                </CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={fetchPrivacyPolicies}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search privacy policies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Published">Published</SelectItem>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading privacy policies...</span>
              </div>
            ) : privacyPolicies.length === 0 ? (
              <div className="text-center py-10">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium text-muted-foreground mb-2">No privacy policies found</p>
                <p className="text-sm text-muted-foreground">
                  {searchTerm || statusFilter !== "all"
                    ? "No privacy policies found matching your filters."
                    : "No privacy policies found. Create your first privacy policy!"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {privacyPolicies.map((privacy) => (
                  <div key={privacy.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{privacy.title}</p>
                        <div className="text-sm text-muted-foreground line-clamp-2">
                          <RichTextDisplay
                            content={privacy.content.substring(0, 150) + "..."}
                            className="prose-sm"
                          />
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-muted-foreground">Version: {privacy.version}</p>
                          {privacy.effectiveDate && (
                            <>
                              <span className="text-xs text-muted-foreground">•</span>
                              <p className="text-xs text-muted-foreground">
                                Effective: {new Date(privacy.effectiveDate).toLocaleDateString()}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant="secondary" className={getStatusColor(privacy.status)}>
                        {privacy.status}
                      </Badge>
                      <div className="flex items-center space-x-2">
                        {privacy.status === "Draft" && privacy.id && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePublishPrivacy(privacy.id!)}
                            className="flex items-center gap-1"
                          >
                            <Eye className="h-3 w-3" />
                            Publish
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedPrivacy(privacy);
                            setIsEditModalOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setPrivacyToDelete(privacy);
                            setIsDeleteModalOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        {/* Modals */}
        <PrivacyModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleSavePrivacy}
          privacy={null}
        />
        <PrivacyModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedPrivacy(null);
          }}
          onSave={handleSavePrivacy}
          privacy={selectedPrivacy}
        />
        <DeletePrivacyModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setPrivacyToDelete(null);
          }}
          onConfirm={handleDeletePrivacy}
          privacy={privacyToDelete}
        />
      </div>
    </PageContainer>
  );
}