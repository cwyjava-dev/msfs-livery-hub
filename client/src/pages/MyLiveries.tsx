import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Download, Image as ImageIcon, Loader2, Upload } from "lucide-react";

export default function MyLiveries() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { data: liveries, isLoading } = trpc.livery.myLiveries.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (authLoading) {
    return (
      <Layout>
        <div className="container mx-auto py-12 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="container mx-auto py-12">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>로그인이 필요합니다</CardTitle>
              <CardDescription>내 리버리를 보려면 로그인해주세요.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <a href={getLoginUrl()}>로그인</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">내 리버리</h1>
            <p className="text-muted-foreground">
              업로드한 리버리 목록입니다.
            </p>
          </div>
          <Button asChild>
            <Link href="/upload">
              <Upload className="mr-2 h-4 w-4" />
              새 리버리 업로드
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="aspect-video bg-muted animate-pulse" />
                <CardHeader>
                  <div className="h-6 bg-muted animate-pulse rounded mb-2" />
                  <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : liveries && liveries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveries.map((livery) => (
              <Link key={livery.id} href={`/livery/${livery.id}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <div className="aspect-video bg-muted flex items-center justify-center overflow-hidden">
                    {livery.screenshots && livery.screenshots.length > 0 ? (
                      <img
                        src={livery.screenshots[0]}
                        alt={livery.liveryName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="h-12 w-12 text-muted-foreground" />
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle className="line-clamp-1">{livery.liveryName}</CardTitle>
                    <CardDescription>
                      {livery.manufacturer} {livery.aircraft} • {livery.brand}
                    </CardDescription>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                      <Download className="h-4 w-4" />
                      <span>{livery.downloadCount || 0} 다운로드</span>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center space-y-4">
              <p className="text-muted-foreground">아직 업로드한 리버리가 없습니다.</p>
              <Button asChild>
                <Link href="/upload">
                  <Upload className="mr-2 h-4 w-4" />
                  첫 리버리 업로드하기
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
