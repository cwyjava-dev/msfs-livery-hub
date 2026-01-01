import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Search, Download, Image as ImageIcon, Filter } from "lucide-react";
import {
  MANUFACTURERS,
  AIRCRAFT_BY_MANUFACTURER,
  COMMON_BRANDS,
  type Manufacturer,
} from "../../../shared/aircraft";

export default function Liveries() {
  const [manufacturer, setManufacturer] = useState<string>("");
  const [aircraft, setAircraft] = useState<string>("");
  const [brand, setBrand] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [searchInput, setSearchInput] = useState<string>("");

  const { data: liveries, isLoading } = trpc.livery.list.useQuery({
    manufacturer: manufacturer || undefined,
    aircraft: aircraft || undefined,
    brand: brand || undefined,
    search: search || undefined,
    limit: 50,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const handleReset = () => {
    setManufacturer("");
    setAircraft("");
    setBrand("");
    setSearch("");
    setSearchInput("");
  };

  const availableAircraft = manufacturer
    ? AIRCRAFT_BY_MANUFACTURER[manufacturer as Manufacturer]
    : [];

  const hasActiveFilters = manufacturer || aircraft || brand || search;

  return (
    <Layout>
      <div className="container mx-auto py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">리버리 목록</h1>
          <p className="text-muted-foreground">
            원하는 항공기 리버리를 검색하고 다운로드하세요.
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              검색 및 필터
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              {/* Search */}
              <div className="space-y-2">
                <Label htmlFor="search">검색</Label>
                <div className="flex gap-2">
                  <Input
                    id="search"
                    placeholder="리버리 이름 또는 설명 검색..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                  <Button type="submit">
                    <Search className="h-4 w-4 mr-2" />
                    검색
                  </Button>
                </div>
              </div>

              {/* Filters Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Manufacturer */}
                <div className="space-y-2">
                  <Label htmlFor="filter-manufacturer">제조사</Label>
                  <Select
                    value={manufacturer}
                    onValueChange={(value) => {
                      setManufacturer(value);
                      setAircraft("");
                    }}
                  >
                    <SelectTrigger id="filter-manufacturer">
                      <SelectValue placeholder="전체" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체</SelectItem>
                      {MANUFACTURERS.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Aircraft */}
                <div className="space-y-2">
                  <Label htmlFor="filter-aircraft">기종</Label>
                  <Select
                    value={aircraft}
                    onValueChange={setAircraft}
                    disabled={!manufacturer || manufacturer === "all"}
                  >
                    <SelectTrigger id="filter-aircraft">
                      <SelectValue placeholder="전체" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체</SelectItem>
                      {availableAircraft.map((a) => (
                        <SelectItem key={a} value={a}>
                          {a}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Brand */}
                <div className="space-y-2">
                  <Label htmlFor="filter-brand">브랜드</Label>
                  <Select value={brand} onValueChange={setBrand}>
                    <SelectTrigger id="filter-brand">
                      <SelectValue placeholder="전체" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체</SelectItem>
                      {COMMON_BRANDS.filter((b) => b !== "기타 (직접 입력)").map((b) => (
                        <SelectItem key={b} value={b}>
                          {b}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {hasActiveFilters && (
                <Button type="button" variant="outline" onClick={handleReset}>
                  필터 초기화
                </Button>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Results */}
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
        ) : liveries && liveries.length > 0 ? (
          <>
            <div className="mb-4 text-sm text-muted-foreground">
              총 {liveries.length}개의 리버리
            </div>
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
                      <div className="flex items-center justify-between text-sm text-muted-foreground mt-2">
                        <div className="flex items-center gap-2">
                          <Download className="h-4 w-4" />
                          <span>{livery.downloadCount || 0}</span>
                        </div>
                        {livery.uploader?.name && (
                          <span className="text-xs">by {livery.uploader.name}</span>
                        )}
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                {hasActiveFilters
                  ? "검색 조건에 맞는 리버리가 없습니다."
                  : "아직 업로드된 리버리가 없습니다."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
