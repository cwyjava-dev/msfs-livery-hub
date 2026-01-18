import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Upload from "./pages/Upload";
import Liveries from "./pages/Liveries";
import LiveryDetail from "./pages/LiveryDetail";
import Contact from "./pages/Contact";
import MyLiveries from "./pages/MyLiveries";
import Login from "./pages/Login";
import Register from "./pages/Register";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/upload" component={Upload} />
      <Route path="/liveries" component={Liveries} />
      <Route path="/livery/:id" component={LiveryDetail} />
      <Route path="/contact" component={Contact} />
      <Route path="/my-liveries" component={MyLiveries} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
