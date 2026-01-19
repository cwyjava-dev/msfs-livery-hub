import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Plane, Upload, Search, AlertCircle, Download, Image as ImageIcon, Zap, Users, Globe } from "lucide-react";
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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % BACKGROUND_IMAGES.length);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Layout>
      {/* Hero Section - Modern Gradient Overlay */}
      <section
        className="relative py-48 md:py-64 overflow-hidden"
        style={{
          backgroundImage: `url(${BACKGROUND_IMAGES[currentImageIndex]})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          transition: "background-image 1s ease-in-out",
        }}
      >
        {/* Modern gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/40" />
        
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
          <div className="absolute top-40 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse animation-delay-2000" />
        </div>

        <div className="container mx-auto text-center relative z-10 px-4">
          {/* Icon with glow effect */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-2xl opacity-50" />
              <Plane className="h-28 w-28 text-white drop-shadow-2xl relative z-10" />
            </div>
          </div>

          {/* Main heading with gradient text effect */}
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 drop-shadow-2xl leading-tight tracking-tight">
            Flight Livery Hub
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto drop-shadow-lg font-light">
            Microsoft Flight Simulator 리버리를 공유하고 다운로드하는 현대적 커뮤니티 플랫폼
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="h-14 px-10 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl hover:shadow-2xl">
              <Link href="/liveries">
                <Search className="mr-3 h-6 w-6" />
                리버리 둘러보기
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="h-14 px-10 text-lg font-semibold bg-white/20 hover:bg-white/30 text-white border-white/40 backdrop-blur-md">
              <Link href="/upload">
                <Upload className="mr-3 h-6 w-6" />
                리버리 업로드
              </Link>
            </Button>
          </div>

          {/* Info text */}
          <p className="text-sm md:text-base text-white/70 mt-12 drop-shadow-lg">
            🌍 글로벌 커뮤니티 • 🔒 안전한 플랫폼 • ⚡ 빠른 다운로드
          </p>
        </div>
      </section>

      {/* Image indicator dots */}
      <div className="flex justify-center gap-3 py-8 bg-gradient-to-b from-white to-gray-50">
        {BACKGROUND_IMAGES.map((_, index) => (
          <button
            key={index}
            className={`h-3 transition-all duration-300 rounded-full ${
              index === currentImageIndex 
                ? "bg-gradient-to-r from-blue-600 to-purple-600 w-10" 
                : "bg-gray-300 hover:bg-gray-400 w-3"
            }`}
            onClick={() => setCurrentImageIndex(index)}
            aria-label={`배경 이미지 ${index + 1}`}
          />
        ))}
      </div>

      {/* Beta Notice - Modern Card Style */}
      <section className="py-8 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-blue-100">
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 mt-1">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
                  <AlertCircle className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">베타 서비스 안내</h3>
                <p className="text-gray-700 text-base leading-relaxed">
                  현재 베타 버전에서는 Airbus와 Boeing 항공기 리버리를 지원합니다. Boeing은 현대 민항 기체만 허용(B707, B720, B727 제외)되며, Airbus A340, A350은 iniBuilds 브랜드만 지원됩니다. 업로드 시 기종과 애드온 브랜드를 정확히 선택해 주세요.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-16">왜 Flight Livery Hub를 선택할까요?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: "빠른 다운로드",
                description: "최적화된 서버로 리버리를 빠르게 다운로드하세요"
              },
              {
                icon: Users,
                title: "활발한 커뮤니티",
                description: "전 세계 비행 시뮬레이터 팬들과 연결하세요"
              },
              {
                icon: Globe,
                title: "다양한 리버리",
                description: "수천 개의 고품질 리버리를 탐색하세요"
              }
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className="group p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 hover:from-blue-50 hover:to-purple-50 transition-all duration-300 border border-gray-200 hover:border-blue-200 hover:shadow-lg">
                  <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-700">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Installation Guide - Modern Grid */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-16 text-center">설치 방법 안내</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  step: 1,
                  title: "Community 폴더 위치",
                  description: "C:\\Users\\[사용자명]\\AppData\\Local\\Packages\\Microsoft.FlightSimulator_[ID]\\LocalCache\\Packages\\Community"
                },
                {
                  step: 2,
                  title: "리버리 파일 추출",
                  description: "다운로드한 ZIP 파일을 압축 해제하여 폴더를 얻습니다."
                },
                {
                  step: 3,
                  title: "Community 폴더에 복사",
                  description: "압축 해제된 폴더를 Community 폴더에 복사합니다."
                },
                {
                  step: 4,
                  title: "게임 재시작",
                  description: "Microsoft Flight Simulator를 재시작하면 리버리가 적용됩니다."
                }
              ].map((item, idx) => (
                <div key={idx} className="group p-8 rounded-2xl bg-white border-2 border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg group-hover:scale-110 transition-transform duration-300">
                      {item.step}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                      <p className="text-gray-700 text-sm leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Recent Liveries - Modern Grid */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-center">최신 리버리</h2>
          <p className="text-center text-gray-600 text-lg mb-16">커뮤니티에서 최근 업로드된 멋진 리버리들을 확인하세요</p>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin">
                <div className="h-12 w-12 border-4 border-gray-300 border-t-blue-600 rounded-full" />
              </div>
            </div>
          ) : recentLiveries && recentLiveries.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recentLiveries.map((livery) => (
                <Link key={livery.id} href={`/livery/${livery.id}`}>
                  <div className="group h-full bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-blue-400 hover:shadow-2xl transition-all duration-300 cursor-pointer">
                    {livery.screenshots && livery.screenshots.length > 0 && (
                      <div className="relative h-56 overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300">
                        <img
                          src={livery.screenshots[0]}
                          alt={livery.liveryName}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{livery.liveryName}</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        {livery.manufacturer} {livery.aircraft}
                      </p>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">브랜드:</span>
                          <span className="font-semibold text-gray-900">{livery.brand}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 flex items-center gap-1">
                            <Download className="h-4 w-4" /> 다운로드
                          </span>
                          <span className="font-semibold text-gray-900">{livery.downloadCount || 0}</span>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-gray-200">
                        <button className="w-full py-2 px-4 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-sm hover:from-blue-700 hover:to-purple-700 transition-all duration-300">
                          자세히 보기
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-16 text-center border-2 border-dashed border-gray-300">
              <ImageIcon className="h-20 w-20 text-gray-400 mx-auto mb-6" />
              <p className="text-gray-600 text-xl mb-8 font-medium">아직 업로드된 리버리가 없습니다.</p>
              <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-12 px-8 text-base font-semibold">
                <Link href="/upload">첫 번째 리버리 업로드하기</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">커뮤니티에 참여하세요</h2>
          <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto">
            당신의 멋진 리버리를 공유하고 다른 사람들의 창작물을 발견해보세요
          </p>
          <Button size="lg" asChild className="h-14 px-10 text-lg font-semibold bg-white text-blue-600 hover:bg-gray-100 shadow-xl hover:shadow-2xl">
            <Link href="/upload">지금 시작하기</Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
}
