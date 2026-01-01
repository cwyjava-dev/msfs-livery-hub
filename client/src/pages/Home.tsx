import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Plane, Upload, Search, AlertCircle, Download, Image as ImageIcon } from "lucide-react";

export default function Home() {
  const { data: recentLiveries, isLoading } = trpc.livery.list.useQuery({
    limit: 6,
  });

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-orange-100 via-pink-100 to-purple-100 py-16 md:py-24">
        <div className="container mx-auto text-center">
          <div className="flex justify-center mb-6">
            <Plane className="h-16 w-16 text-orange-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            MSFS Livery Hub
          </h1>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            Microsoft Flight Simulator 리버리를 공유하고 다운로드하는 커뮤니티 플랫폼
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/liveries">
                <Search className="mr-2 h-5 w-5" />
                리버리 둘러보기
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/upload">
                <Upload className="mr-2 h-5 w-5" />
                리버리 업로드
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Beta Notice */}
      <section className="container mx-auto py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>베타 서비스 안내</AlertTitle>
          <AlertDescription>
            현재 베타 버전에서는 Airbus와 Boeing 항공기 리버리를 지원합니다.
            Boeing은 현대 민항 기체만 허용(B707, B720, B727 제외)되며,
            Airbus A340, A350은 iniBuilds 브랜드만 지원됩니다.
            업로드 시 기종과 애드온 브랜드를 정확히 선택해 주세요.
            본 사이트는 사용자 제작 리버리 공유 플랫폼이며, 일부 자료는 검수 없이 공개됩니다.
          </AlertDescription>
        </Alert>
      </section>

      {/* Features */}
      <section className="container mx-auto py-12">
        <h2 className="text-3xl font-bold text-center text-foreground mb-12">주요 기능</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <Upload className="h-10 w-10 text-primary mb-2" />
              <CardTitle>간편한 업로드</CardTitle>
              <CardDescription>
                제조사, 기종, 브랜드를 선택하고 리버리 파일과 스크린샷을 업로드하세요.
                승인 대기 없이 즉시 공개됩니다.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Search className="h-10 w-10 text-primary mb-2" />
              <CardTitle>체계적인 검색</CardTitle>
              <CardDescription>
                제조사, 기종, 브랜드 기준으로 원하는 리버리를 빠르게 찾을 수 있습니다.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Download className="h-10 w-10 text-primary mb-2" />
              <CardTitle>즉시 다운로드</CardTitle>
              <CardDescription>
                Community 폴더에 설치하는 방법과 함께 리버리를 바로 다운로드할 수 있습니다.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Recent Liveries */}
      <section className="container mx-auto py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-foreground">최근 업로드된 리버리</h2>
          <Button variant="outline" asChild>
            <Link href="/liveries">전체 보기</Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="aspect-video bg-muted animate-pulse" />
                <CardHeader>
                  <div className="h-6 bg-muted animate-pulse rounded mb-2" />
                  <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : recentLiveries && recentLiveries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentLiveries.map((livery) => (
              <Link key={livery.id} href={`/livery/${livery.id}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
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
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">아직 업로드된 리버리가 없습니다.</p>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Installation Guide */}
      <section className="bg-muted/50 py-12">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center text-foreground mb-8">설치 방법</h2>
          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle>Community 폴더 설치 안내</CardTitle>
              <CardDescription>
                다운로드한 리버리를 MSFS에 설치하는 방법입니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">리버리 파일 다운로드</h3>
                  <p className="text-sm text-muted-foreground">
                    원하는 리버리 페이지에서 파일을 다운로드합니다.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">압축 해제</h3>
                  <p className="text-sm text-muted-foreground">
                    다운로드한 파일의 압축을 해제합니다.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Community 폴더로 이동</h3>
                  <p className="text-sm text-muted-foreground">
                    압축 해제한 폴더를 MSFS의 Community 폴더로 복사합니다.
                    <br />
                    <code className="text-xs bg-muted px-2 py-1 rounded mt-1 inline-block">
                      C:\Users\[사용자명]\AppData\Local\Packages\Microsoft.FlightSimulator_...\LocalCache\Packages\Community
                    </code>
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">시뮬레이터 재시작</h3>
                  <p className="text-sm text-muted-foreground">
                    MSFS를 재시작하면 새로운 리버리가 적용됩니다.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
}
