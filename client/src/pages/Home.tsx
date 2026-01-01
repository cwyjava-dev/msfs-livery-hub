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
        className="relative py-40 md:py-56 overflow-hidden"
        style={{
          backgroundImage: `url(${BACKGROUND_IMAGES[currentImageIndex]})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          transition: "background-image 1s ease-in-out",
        }}
      >
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/45" />
        <div className="container mx-auto text-center relative z-10 px-4">
          <div className="flex justify-center mb-8">
            <Plane className="h-24 w-24 text-white drop-shadow-lg" />
          </div>
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg leading-tight">
            Flight Livery Hub
          </h1>
          <p className="text-2xl md:text-3xl text-white mb-12 max-w-3xl mx-auto drop-shadow-lg font-light">
            Microsoft Flight Simulator 리버리를 공유하고 다운로드하는 커뮤니티 플랫폼
          </p>
          <p className="text-xs md:text-sm text-white/70 mb-8 drop-shadow-lg">
            이 사이트는 프랑스 파리의 서버를 기반으로 하며 사이트 국가는 대한민국을 기반으로 합니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button size="lg" asChild className="bg-blue-600 hover:bg-blue-700 h-14 px-8 text-lg">
              <Link href="/liveries">
                <Search className="mr-3 h-6 w-6" />
                리버리 둘러보기
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="bg-white/95 hover:bg-white text-gray-800 h-14 px-8 text-lg border-2">
              <Link href="/upload">
                <Upload className="mr-3 h-6 w-6" />
                리버리 업로드
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Image indicator dots */}
      <div className="flex justify-center gap-3 py-6 bg-white">
        {BACKGROUND_IMAGES.map((_, index) => (
          <button
            key={index}
            className={`h-3 w-3 rounded-full transition-all ${
              index === currentImageIndex ? "bg-blue-600 w-10" : "bg-gray-300 hover:bg-gray-400"
            }`}
            onClick={() => setCurrentImageIndex(index)}
            aria-label={`배경 이미지 ${index + 1}`}
          />
        ))}
      </div>

      {/* Beta Notice */}
      <section className="bg-blue-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex gap-4 items-start">
            <AlertCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">베타 서비스 안내</h3>
              <p className="text-blue-800 text-base leading-relaxed">
                현재 베타 버전에서는 Airbus와 Boeing 항공기 리버리를 지원합니다. Boeing은 현대 민항 기체만 허용(B707, B720, B727 제외)되며, Airbus A340, A350은 iniBuilds 브랜드만 지원됩니다. 업로드 시 기종과 애드온 브랜드를 정확히 선택해 주세요.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Installation Guide */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl font-bold text-gray-900 mb-12 text-center">설치 방법 안내</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-50 p-8 rounded-lg">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-lg bg-blue-600 text-white text-lg font-bold">1</div>
                  <h3 className="ml-4 text-2xl font-semibold text-gray-900">Community 폴더 위치</h3>
                </div>
                <p className="text-gray-700 text-lg">
                  C:\Users\[사용자명]\AppData\Local\Packages\Microsoft.FlightSimulator_[ID]\LocalCache\Packages\Community
                </p>
              </div>
              <div className="bg-gray-50 p-8 rounded-lg">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-lg bg-blue-600 text-white text-lg font-bold">2</div>
                  <h3 className="ml-4 text-2xl font-semibold text-gray-900">리버리 파일 추출</h3>
                </div>
                <p className="text-gray-700 text-lg">
                  다운로드한 ZIP 파일을 압축 해제하여 폴더를 얻습니다.
                </p>
              </div>
              <div className="bg-gray-50 p-8 rounded-lg">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-lg bg-blue-600 text-white text-lg font-bold">3</div>
                  <h3 className="ml-4 text-2xl font-semibold text-gray-900">Community 폴더에 복사</h3>
                </div>
                <p className="text-gray-700 text-lg">
                  압축 해제된 폴더를 Community 폴더에 복사합니다.
                </p>
              </div>
              <div className="bg-gray-50 p-8 rounded-lg">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-lg bg-blue-600 text-white text-lg font-bold">4</div>
                  <h3 className="ml-4 text-2xl font-semibold text-gray-900">게임 재시작</h3>
                </div>
                <p className="text-gray-700 text-lg">
                  Microsoft Flight Simulator를 재시작하면 리버리가 적용됩니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Liveries */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl font-bold text-gray-900 mb-16 text-center">최신 리버리</h2>
          {isLoading ? (
            <div className="flex justify-center py-16">
              <p className="text-gray-600 text-xl">로딩 중...</p>
            </div>
          ) : recentLiveries && recentLiveries.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recentLiveries.map((livery) => (
                <Link key={livery.id} href={`/livery/${livery.id}`}>
                  <div className="bg-white rounded-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer h-full">
                    {livery.screenshots && livery.screenshots.length > 0 && (
                      <div className="relative h-56 overflow-hidden bg-gray-200">
                        <img
                          src={livery.screenshots[0]}
                          alt={livery.liveryName}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{livery.liveryName}</h3>
                      <p className="text-gray-600 text-lg mb-4">
                        {livery.manufacturer} {livery.aircraft}
                      </p>
                      <div className="space-y-2">
                        <p className="text-base text-gray-700">
                          <strong>브랜드:</strong> {livery.brand}
                        </p>
                        <p className="text-base text-gray-700">
                          <strong>다운로드:</strong> {livery.downloadCount || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg p-16 text-center">
              <ImageIcon className="h-20 w-20 text-gray-400 mx-auto mb-6" />
              <p className="text-gray-600 text-2xl mb-8">아직 업로드된 리버리가 없습니다.</p>
              <Button asChild className="bg-blue-600 hover:bg-blue-700 h-14 px-8 text-lg">
                <Link href="/upload">첫 번째 리버리 업로드하기</Link>
              </Button>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
