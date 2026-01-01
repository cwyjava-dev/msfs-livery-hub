import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { Upload as UploadIcon, X, Image as ImageIcon, Loader2, AlertCircle } from "lucide-react";
import {
  MANUFACTURERS,
  AIRCRAFT_BY_MANUFACTURER,
  COMMON_BRANDS,
  MSFS_VERSIONS,
  hasRestrictedBrands,
  getAllowedBrands,
  isBrandAllowed,
  type Manufacturer,
} from "../../../shared/aircraft";
import { storagePut } from "../../../server/storage";

export default function Upload() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  const [manufacturer, setManufacturer] = useState<Manufacturer | "">("");
  const [aircraft, setAircraft] = useState("");
  const [brand, setBrand] = useState("");
  const [customBrand, setCustomBrand] = useState("");
  const [liveryName, setLiveryName] = useState("");
  const [description, setDescription] = useState("");
  const [msfsVersion, setMsfsVersion] = useState<"2020" | "2024" | "Both" | "">("");
  const [installMethod, setInstallMethod] = useState("");
  const [agreed, setAgreed] = useState(false);

  const [screenshots, setScreenshots] = useState<File[]>([]);
  const [screenshotPreviews, setScreenshotPreviews] = useState<string[]>([]);
  const [liveryFile, setLiveryFile] = useState<File | null>(null);

  const [uploading, setUploading] = useState(false);

  const screenshotInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createMutation = trpc.livery.create.useMutation({
    onSuccess: (data) => {
      toast.success("리버리가 성공적으로 업로드되었습니다!");
      setLocation(`/livery/${data.id}`);
    },
    onError: (error) => {
      toast.error(error.message || "업로드 중 오류가 발생했습니다.");
      setUploading(false);
    },
  });

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (screenshots.length + files.length > 4) {
      toast.error("스크린샷은 최대 4장까지 업로드할 수 있습니다.");
      return;
    }

    setScreenshots([...screenshots, ...files]);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeScreenshot = (index: number) => {
    setScreenshots(screenshots.filter((_, i) => i !== index));
    setScreenshotPreviews(screenshotPreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated || !user) {
      toast.error("로그인이 필요합니다.");
      return;
    }

    if (!manufacturer || !aircraft || !brand || !liveryName || !liveryFile) {
      toast.error("필수 항목을 모두 입력해주세요.");
      return;
    }

    if (!agreed) {
      toast.error("업로드 동의에 체크해주세요.");
      return;
    }

    const finalBrand = brand === "기타 (직접 입력)" ? customBrand : brand;
    if (!finalBrand) {
      toast.error("브랜드를 입력해주세요.");
      return;
    }

    // Validate brand restrictions
    if (!isBrandAllowed(aircraft, finalBrand)) {
      toast.error(`${aircraft} 기종은 iniBuilds 브랜드만 허용됩니다.`);
      return;
    }

    setUploading(true);

    try {
      // Upload screenshots to S3
      const screenshotUrls: string[] = [];
      for (const screenshot of screenshots) {
        const buffer = await screenshot.arrayBuffer();
        const key = `liveries/${user.id}/screenshots/${Date.now()}-${screenshot.name}`;
        
        // Note: storagePut is a server-side function, we need to handle file upload differently
        // For now, we'll use a placeholder approach - in production, use a proper file upload endpoint
        const formData = new FormData();
        formData.append("file", screenshot);
        
        // This is a simplified approach - in production, create a dedicated upload endpoint
        const response = await fetch("/api/upload-screenshot", {
          method: "POST",
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error("Screenshot upload failed");
        }
        
        const { url } = await response.json();
        screenshotUrls.push(url);
      }

      // Upload livery file
      const fileFormData = new FormData();
      fileFormData.append("file", liveryFile);
      
      const fileResponse = await fetch("/api/upload-livery", {
        method: "POST",
        body: fileFormData,
      });
      
      if (!fileResponse.ok) {
        throw new Error("Livery file upload failed");
      }
      
      const { url: fileUrl, key: fileKey } = await fileResponse.json();

      // Create livery record
      await createMutation.mutateAsync({
        manufacturer,
        aircraft,
        brand: finalBrand,
        liveryName,
        description: description || undefined,
        msfsVersion: msfsVersion || undefined,
        installMethod: installMethod || undefined,
        screenshots: screenshotUrls.length > 0 ? screenshotUrls : undefined,
        fileUrl,
        fileKey,
        fileName: liveryFile.name,
        fileSize: liveryFile.size,
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("파일 업로드 중 오류가 발생했습니다.");
      setUploading(false);
    }
  };

  const availableAircraft = manufacturer ? AIRCRAFT_BY_MANUFACTURER[manufacturer] : [];
  const availableBrands = aircraft && hasRestrictedBrands(aircraft)
    ? getAllowedBrands(aircraft)
    : COMMON_BRANDS;

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
              <CardDescription>리버리를 업로드하려면 로그인해주세요.</CardDescription>
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
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">리버리 업로드</h1>
            <p className="text-muted-foreground">
              제작하신 리버리를 커뮤니티와 공유해보세요. 업로드 즉시 공개됩니다.
            </p>
          </div>

          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>업로드 전 확인사항:</strong> Boeing은 현대 민항 기체만 허용(B707, B720, B727 제외)됩니다.
              Airbus A340, A350은 iniBuilds 브랜드만 지원됩니다.
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>기본 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Manufacturer */}
                <div className="space-y-2">
                  <Label htmlFor="manufacturer">제조사 *</Label>
                  <Select
                    value={manufacturer}
                    onValueChange={(value) => {
                      setManufacturer(value as Manufacturer);
                      setAircraft("");
                      setBrand("");
                    }}
                  >
                    <SelectTrigger id="manufacturer">
                      <SelectValue placeholder="제조사를 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
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
                  <Label htmlFor="aircraft">기종 *</Label>
                  <Select
                    value={aircraft}
                    onValueChange={(value) => {
                      setAircraft(value);
                      setBrand("");
                    }}
                    disabled={!manufacturer}
                  >
                    <SelectTrigger id="aircraft">
                      <SelectValue placeholder="기종을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
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
                  <Label htmlFor="brand">브랜드 / 애드온 *</Label>
                  <Select value={brand} onValueChange={setBrand} disabled={!aircraft}>
                    <SelectTrigger id="brand">
                      <SelectValue placeholder="브랜드를 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableBrands.map((b) => (
                        <SelectItem key={b} value={b}>
                          {b}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {brand === "기타 (직접 입력)" && (
                    <Input
                      placeholder="브랜드 이름을 입력하세요"
                      value={customBrand}
                      onChange={(e) => setCustomBrand(e.target.value)}
                    />
                  )}
                  {aircraft && hasRestrictedBrands(aircraft) && (
                    <p className="text-sm text-amber-600">
                      ⚠️ {aircraft} 기종은 iniBuilds 브랜드만 허용됩니다.
                    </p>
                  )}
                </div>

                {/* Livery Name */}
                <div className="space-y-2">
                  <Label htmlFor="liveryName">리버리 이름 *</Label>
                  <Input
                    id="liveryName"
                    placeholder="예: Korean Air 대한항공"
                    value={liveryName}
                    onChange={(e) => setLiveryName(e.target.value)}
                    maxLength={256}
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">설명 (선택)</Label>
                  <Textarea
                    id="description"
                    placeholder="리버리에 대한 간단한 설명을 입력하세요"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                  />
                </div>

                {/* MSFS Version */}
                <div className="space-y-2">
                  <Label htmlFor="msfsVersion">MSFS 버전 (선택)</Label>
                  <Select value={msfsVersion} onValueChange={(v: any) => setMsfsVersion(v)}>
                    <SelectTrigger id="msfsVersion">
                      <SelectValue placeholder="버전을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {MSFS_VERSIONS.map((v) => (
                        <SelectItem key={v} value={v}>
                          MSFS {v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Install Method */}
                <div className="space-y-2">
                  <Label htmlFor="installMethod">설치 방법 (선택)</Label>
                  <Textarea
                    id="installMethod"
                    placeholder="Community 폴더에 압축 해제 후 복사"
                    value={installMethod}
                    onChange={(e) => setInstallMethod(e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>파일 업로드</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Screenshots */}
                <div className="space-y-2">
                  <Label>스크린샷 (최대 4장, 선택)</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {screenshotPreviews.map((preview, index) => (
                      <div key={index} className="relative aspect-video bg-muted rounded-md overflow-hidden">
                        <img src={preview} alt={`Screenshot ${index + 1}`} className="w-full h-full object-cover" />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6"
                          onClick={() => removeScreenshot(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {screenshots.length < 4 && (
                      <button
                        type="button"
                        className="aspect-video bg-muted rounded-md border-2 border-dashed border-border hover:border-primary transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer"
                        onClick={() => screenshotInputRef.current?.click()}
                      >
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">추가</span>
                      </button>
                    )}
                  </div>
                  <input
                    ref={screenshotInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleScreenshotChange}
                  />
                </div>

                {/* Livery File */}
                <div className="space-y-2">
                  <Label htmlFor="liveryFile">리버리 파일 (ZIP) *</Label>
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full"
                    >
                      <UploadIcon className="mr-2 h-4 w-4" />
                      {liveryFile ? liveryFile.name : "파일 선택"}
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".zip"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setLiveryFile(file);
                        }
                      }}
                    />
                  </div>
                  {liveryFile && (
                    <p className="text-sm text-muted-foreground">
                      파일 크기: {(liveryFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Checkbox id="agree" checked={agreed} onCheckedChange={(checked) => setAgreed(checked === true)} />
                  <div className="space-y-1">
                    <Label htmlFor="agree" className="text-sm font-medium cursor-pointer">
                      본 리버리는 본인이 직접 제작한 창작물이며, 타인의 작업물을 무단 배포하지 않았음을 확인합니다.
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="mt-6 flex gap-4">
              <Button type="submit" size="lg" disabled={uploading} className="flex-1">
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    업로드 중...
                  </>
                ) : (
                  <>
                    <UploadIcon className="mr-2 h-4 w-4" />
                    업로드
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
