import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { Loader2, Mail, CheckCircle } from "lucide-react";
import { CONTACT_TYPES } from "../../../shared/aircraft";

export default function Contact() {
  const [, setLocationPath] = useLocation();
  const [type, setType] = useState<"general" | "upload_error" | "copyright" | "feature_request">("general");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Parse URL params for pre-filled report
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const liveryId = params.get("liveryId");
    const liveryName = params.get("liveryName");
    const aircraft = params.get("aircraft");
    const brand = params.get("brand");

    if (liveryId && liveryName) {
      setType("copyright");
      setTitle(`리버리 신고: ${liveryName}`);
      setContent(
        `리버리 ID: ${liveryId}\n리버리 이름: ${liveryName}\n항공기: ${aircraft || "N/A"}\n브랜드: ${brand || "N/A"}\n\n신고 내용:\n`
      );
    }
  }, []);

  const submitMutation = trpc.contact.submit.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("문의가 성공적으로 제출되었습니다.");
    },
    onError: (error) => {
      toast.error(error.message || "제출 중 오류가 발생했습니다.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!type || !title || !content || !email) {
      toast.error("모든 필수 항목을 입력해주세요.");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("올바른 이메일 주소를 입력해주세요.");
      return;
    }

    submitMutation.mutate({
      type,
      title,
      content,
      email,
    });
  };

  if (submitted) {
    return (
      <Layout>
        <div className="container mx-auto py-12">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="py-12 text-center space-y-4">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <h2 className="text-2xl font-bold text-foreground">제출 완료</h2>
              <p className="text-muted-foreground">
                문의가 성공적으로 제출되었습니다. 입력하신 이메일로 답변을 보내드리겠습니다.
              </p>
              <Button onClick={() => setLocationPath("/")}>홈으로 돌아가기</Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-12">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">문의 / 신고</h1>
            <p className="text-muted-foreground mb-4">
              버그, 오류, 저작권 문제, 개선 제안 등을 보내주세요.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-900">
                <span className="font-semibold">Flight Livery Hub 지원센터</span>
                <br />
                아래 양식을 작성하고 제출하면 <span className="font-semibold">beulpailo@gmail.com</span>으로 메일이 전송됩니다.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  문의 정보
                </CardTitle>
                <CardDescription>
                  모든 항목은 필수입니다. 입력하신 내용은 Flight Livery Hub 지원센터(beulpailo@gmail.com)로 전송되며, 입력하신 이메일로 답변을 보내드립니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Type */}
                <div className="space-y-2">
                  <Label htmlFor="type">문의 유형 *</Label>
                  <Select value={type} onValueChange={(v: any) => setType(v)}>
                    <SelectTrigger id="type">
                      <SelectValue placeholder="유형을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTACT_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">이메일 *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    답변을 받으실 이메일 주소를 입력해주세요.
                  </p>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">제목 *</Label>
                  <Input
                    id="title"
                    placeholder="문의 제목을 입력하세요"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={256}
                  />
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <Label htmlFor="content">내용 *</Label>
                  <Textarea
                    id="content"
                    placeholder="문의 내용을 상세히 입력해주세요"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={10}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="mt-6">
              <Button type="submit" size="lg" disabled={submitMutation.isPending} className="w-full">
                {submitMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    제출 중...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    제출하기
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
