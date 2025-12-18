"use client";

import Link from "next/link";
import { ArrowRight, Box, Zap, Layers } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <section className="flex-1 flex flex-col items-center justify-center space-y-10 py-24 px-4 text-center md:py-32">
        <div className="space-y-4 max-w-3xl">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl bg-clip-text text-transparent bg-linear-to-r from-primary to-teal-400"
          >
            The Lightweight Powerhouse for Flutter
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mx-auto max-w-[700px] text-muted-foreground md:text-xl"
          >
            RxGet strips away the bloat of GetX, keeping only the essentials: <span className="text-foreground font-semibold">High-performance State Management</span> and <span className="text-foreground font-semibold">Intelligent Dependency Injection</span>.
          </motion.p>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col gap-4 min-[400px]:flex-row"
        >
          <Link
            href="/docs"
            className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            Get Started
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          <Link
            href="https://github.com/rxget/rxget"
            target="_blank"
            className="inline-flex h-12 items-center justify-center rounded-md border border-input bg-background/50 backdrop-blur-sm px-8 text-sm font-medium shadow-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            View on GitHub
          </Link>
        </motion.div>
      </section>

      <section className="container py-12 md:py-24 lg:py-32 mx-auto px-4">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <FeatureCard 
            icon={<Zap className="h-10 w-10 text-primary" />}
            title="Blazing Fast"
            description="Built for performance. No streams, no ChangeNotifier. Just pure, lightweight reactivity."
            delay={0.3}
          />
          <FeatureCard 
            icon={<Layers className="h-10 w-10 text-primary" />}
            title="Dependency Injection"
            description="Decouple your logic from your UI. Inject dependencies lazily and accessing them anywhere."
            delay={0.4}
          />
          <FeatureCard 
            icon={<Box className="h-10 w-10 text-primary" />}
            title="Zero Bloat"
            description="No routing, no snackbars, no validation utils. Just the core state management you need."
            delay={0.5}
          />
        </div>
      </section>

      <section className="container py-12 md:py-24 mx-auto px-4 border-t border-muted">
        <div className="mx-auto max-w-4xl space-y-8">
            <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight md:text-4xl text-foreground">Write Less, Do More</h2>
                <p className="mt-4 text-muted-foreground text-lg">Reactive state management has never been this simple.</p>
            </div>
            
            <div className="rounded-xl border border-border bg-card p-6 shadow-xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-linear-to-tr from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <pre className="overflow-x-auto text-sm md:text-base font-mono leading-relaxed text-foreground">
                    <code className="language-dart">
{`// 1. Create a controller
class CountController extends GetxController {
  var count = 0.obs;
  increment() => count++;
}

// 2. Inject it
final controller = Get.put(CountController());

// 3. Use it in UI
Obx(() => Text("Clicks: \${controller.count}"));`}
                    </code>
                </pre>
            </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="flex flex-col items-center space-y-4 rounded-xl border border-border bg-card/50 p-6 shadow-sm backdrop-blur-sm transition-all hover:bg-card hover:shadow-md text-center"
    >
      <div className="rounded-full bg-primary/10 p-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-muted-foreground">
        {description}
      </p>
    </motion.div>
  );
}
