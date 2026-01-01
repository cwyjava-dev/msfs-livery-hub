import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useRoute, Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Download, AlertCircle, User, Calendar, Image as ImageIcon, Loader2, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function LiveryDetail() {
  const [, params] = useRoute("/livery/:id");
  const liveryId = params?.id ? parseInt(params.id) : 0;

  const { data: livery, isLoading } = trpc.livery.getById.useQuery(
    { id: liveryId },
    { enabled: liveryId > 0 }
  );

  const downloadMutation = trpc.livery.download.useMutation({
    onSuccess: () => {
      toast.success("다운로드가 시작됩니다.");
    },
  });

  const deleteMutation = trpc.livery.delete.useMutation({
    onSuccess: () => {
      toast.success("리버리가 삭제되었습니다.");
      navigate("/liveries");
    },
    onError: (error) => {
      toast.error(error.message || "삭제 중 오류가 발생했습니다.");
    },
  });

  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [, navigate] = useLocation();
  const { user } = useAuth();

  const handleDownload = () => {
    if (!livery) return;

    // Increment download count
    downloadMutation.mutate({ id: liveryId });

    // Trigger file download
    const link = document.createElement("a");
    link.href = livery.fileUrl;
    link.download = livery.fileName || "livery.zip";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto py-12 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!livery) {
    return (
      <Layout>
        <div className="container mx-auto py-12">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">리버리를 찾을 수 없습니다.</p>
              <Button className="mt-4" asChild>
                <Link href="/liveries">목록으로 돌아가기</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const screenshots = livery.screenshots || [];

  return (
    <Layout>
      <div className="container mx-auto py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Screenshots */}
            <Card>
              <CardContent className="p-0">
                {screenshots.length > 0 ? (
                  <div className="space-y-4">
                    {/* Main Image */}
                    <div className="aspect-video bg-muted overflow-hidden rounded-t-lg">
                      <img
                        src={screenshots[selectedImage]}
                        alt={`${livery.liveryName} screenshot ${selectedImage + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Thumbnails */}
                    {screenshots.length > 1 && (
                      <div className="grid grid-cols-4 gap-2 p-4">
                        {screenshots.map((screenshot: string, index: number) => (
                          <button
                            key={index}
                            onClick={() => setSelectedImage(index)}
                            className={`aspect-video bg-muted rounded-md overflow-hidden border-2 transition-all ${
                              selectedImage === index
                                ? "border-primary"
                                : "border-transparent hover:border-border"
                            }`}
                          >
                            <img
                              src={screenshot}
                              alt={`Thumbnail ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="aspect-video bg-muted flex items-center justify-center rounded-t-lg">
                    <ImageIcon className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Details */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-2xl">{livery.liveryName}</CardTitle>
                    <CardDescription className="flex items-center gap-2 text-base">
                      <Badge variant="secondary">{livery.manufacturer}</Badge>
                      <Badge variant="secondary">{livery.aircraft}</Badge>
                      <Badge variant="secondary">{livery.brand}</Badge>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {livery.description && (
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">설명</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{livery.description}</p>
                  </div>
                )}

                <Separator />

                <div className="grid grid-cols-2 gap-4 text-sm">
                  {livery.msfsVersion && (
                    <div>
                      <span className="text-muted-foreground">시뮬레이터:</span>
                      <p className="font-medium text-foreground">MSFS {livery.msfsVersion}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">다운로드:</span>
                    <p className="font-medium text-foreground">{livery.downloadCount || 0}회</p>
                  </div>
                  {livery.uploader?.name && (
                    <div>
                      <span className="text-muted-foreground">업로더:</span>
                      <p className="font-medium text-foreground flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {livery.uploader.name}
                      </p>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">업로드 날짜:</span>
                    <p className="font-medium text-foreground flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(livery.createdAt).toLocaleDateString("ko-KR")}
                    </p>
                  </div>
                </div>

                {livery.installMethod && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">설치 방법</h3>
                      <p className="text-muted-foreground whitespace-pre-wrap">{livery.installMethod}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Download Card */}
            <Card>
              <CardHeader>
                <CardTitle>다운로드</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleDownload}
                  disabled={downloadMutation.isPending}
                >
                  {downloadMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      다운로드 중...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-5 w-5" />
                      다운로드
                    </>
                  )}
                </Button>
                {livery.fileSize && (
                  <p className="text-sm text-muted-foreground text-center">
                    파일 크기: {(livery.fileSize / 1024 / 1024).toFixed(2)} MB
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Edit/Delete Card - Only for owner */}
            {user && livery.uploader?.id === user.id && (
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-base text-blue-900">내 리버리</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/livery/${livery.id}/edit`}>
                      <Edit2 className="mr-2 h-4 w-4" />
                      편집하기
                    </Link>
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => setShowDeleteDialog(true)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    삭제하기
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Report Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">문제 신고</CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" asChild>
                  <Link
                    href={`/contact?liveryId=${livery.id}&liveryName=${encodeURIComponent(
                      livery.liveryName
                    )}&aircraft=${encodeURIComponent(
                      `${livery.manufacturer} ${livery.aircraft}`
                    )}&brand=${encodeURIComponent(livery.brand)}`}
                  >
                    <AlertCircle className="mr-2 h-4 w-4" />
                    신고 / 문의하기
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Installation Guide */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">설치 안내</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <ol className="list-decimal list-inside space-y-2">
                  <li>다운로드한 파일의 압축을 해제합니다.</li>
                  <li>MSFS Community 폴더로 복사합니다.</li>
                  <li>시뮬레이터를 재시작합니다.</li>
                </ol>
                <p className="text-xs mt-4">
                  Community 폴더 위치:
                  <br />
                  <code className="bg-muted px-2 py-1 rounded text-xs break-all">
                    C:\Users\[사용자명]\AppData\Local\Packages\Microsoft.FlightSimulator_...\LocalCache\Packages\Community
                  </code>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>리버리 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              정말로 이 리버리를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3">
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                deleteMutation.mutate({ id: liveryId });
                setShowDeleteDialog(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  삭제 중...
                </>
              ) : (
                "삭제"
              )}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
