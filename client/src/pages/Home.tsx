import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Plane, Upload, Search, AlertCircle, Download, Image as ImageIcon } from "lucide-react";
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";

const BACKGROUND_IMAGES = [
  "/images/backgrounds/airplane-1.jpg",
  "/images/backgrounds/airplane-2.jpg",
  "/images/backgrounds/airplane-3.jpg",
  "/images/backgrounds/airplane-4.jpg",
  "/images/backgrounds/airplane-5.jpg",
];

export default function Home() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { data: recentLiveries, isLoading } = trpc.livery.list.useQuery({
    limit: 6,
  });

  // Change background image every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % BACKGROUND_IMAGES.length);
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <Layout>
      {/* Hero Section with Dynamic Background */}
      <section
        className="relative py-16 md:py-24 overflow-hidden"
        style={{
          backgroundImage: `url(${BACKGROUND_IMAGES[currentImageIndex]})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          transition: "background-image 1s ease-in-out",
        }}
      >
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/40" />
        <div className="container mx-auto text-center relative z-10">
          <div className="flex justify-center mb-6">
            <Plane className="h-16 w-16 text-white drop-shadow-lg" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
            MSFS Livery Hub
          </h1>
          <p className="text-xl text-white mb-8 max-w-2xl mx-auto drop-shadow-lg">
            Microsoft Flight Simulator 리버리를 공유하고 다운로드하는 커뮤니티 플랫폼
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href="/liveries">
                <Search className="mr-2 h-5 w-5" />
                리버리 둘러보기
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="bg-white/90 hover:bg-white text-gray-800">
              <Link href="/upload">
                <Upload className="mr-2 h-5 w-5" />
                리버리 업로드
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Image indicator dots */}
      <div className="flex justify-center gap-2 py-4 bg-gray-100">
        {BACKGROUND_IMAGES.map((_, index) => (
          <button
            key={index}
            className={`h-2 w-2 rounded-full transition-all ${
              index === currentImageIndex ? "bg-blue-600 w-8" : "bg-gray-400"
            }`}
            onClick={() => setCurrentImageIndex(index)}
            aria-label={`배경 이미지 ${index + 1}`}
          />
        ))}
      </div>

      {/* Beta Notice */}
      <section className="container mx-auto py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>베타 서비스 안내</AlertTitle>
          <AlertDescription>
            현재 베타 버전에서는 Airbus와 Boeing 항공기 리버리를 지원합니다. Boeing은 현대 민항 기체만 허용(B707,
            B720, B727 제외)되며, Airbus A340, A350은 iniBuilds 브랜드만 지원됩니다. 업로드 시 기종과 애드온
            브랜드를 정확히 선택해 주세요. 본 사이트는 사용자 제작 리버리 공유 플랫폼이며, 일부 자료는 검수 없이
            공개됩니다. 문의 및 신고는 Contact 메뉴를 이용해 주세요.
          </AlertDescription>
        </Alert>
      </section>

      {/* Installation Guide */}
      <section className="container mx-auto py-12">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-6">설치 방법 안내</h2>
          <Card>
            <CardHeader>
              <CardTitle>Community 폴더에 설치하기</CardTitle>
              <CardDescription>다운로드한 리버리를 올바르게 설치하는 방법</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-2">1단계: Community 폴더 위치 확인</h3>
                <p className="text-muted-foreground">
                  Windows: C:\Users\[사용자명]\AppData\Local\Packages\Microsoft.FlightSimulator_[ID]\LocalCache\Packages\Community
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">2단계: 리버리 파일 추출</h3>
                <p className="text-muted-foreground">
                  다운로드한 ZIP 파일을 압축 해제하여 폴더를 얻습니다.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">3단계: Community 폴더에 복사</h3>
                <p className="text-muted-foreground">
                  압축 해제된 폴더를 Community 폴더에 복사합니다.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">4단계: 게임 재시작</h3>
                <p className="text-muted-foreground">
                  Microsoft Flight Simulator를 재시작하면 리버리가 적용됩니다.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Recent Liveries */}
      <section className="container mx-auto py-12">
        <h2 className="text-2xl font-bold text-foreground mb-6">최신 리버리</h2>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <p className="text-muted-foreground">로딩 중...</p>
          </div>
        ) : recentLiveries && recentLiveries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentLiveries.map((livery) => (
              <Link key={livery.id} href={`/livery/${livery.id}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  {livery.screenshots && livery.screenshots.length > 0 && (
                    <div className="relative h-48 overflow-hidden bg-gray-200">
                      <img
                        src={livery.screenshots[0]}
                        alt={livery.liveryName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-lg">{livery.liveryName}</CardTitle>
                    <CardDescription>
                      {livery.manufacturer} {livery.aircraft}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        <strong>브랜드:</strong> {livery.brand}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <strong>다운로드:</strong> {livery.downloadCount || 0}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">아직 업로드된 리버리가 없습니다.</p>
              <Button asChild className="mt-4">
                <Link href="/upload">첫 번째 리버리 업로드하기</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </section>
    </Layout>
  );
}
