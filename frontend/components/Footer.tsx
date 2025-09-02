import React from "react";
import { Heart, Github, Twitter, Shield, Wand2, BookOpen, LifeBuoy, ExternalLink } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative mt-12 border-t border-gray-200/50 dark:border-gray-800/50 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl">
      {/* top accent line */}
      <div aria-hidden="true" className="h-px w-full bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-sm">F</span>
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                FlexConvert
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              The most powerful file processing suite. Built with privacy in mind, powered by modern web technologies.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <a
                href="/docs.html"
                className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                <BookOpen className="w-3.5 h-3.5" />
                Docs
              </a>
              <a
                href="/support.html"
                className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                <LifeBuoy className="w-3.5 h-3.5" />
                Support
              </a>
              <a
                href="/privacy.html"
                className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                <Shield className="w-3.5 h-3.5" />
                Privacy
              </a>
            </div>
          </div>

          {/* Features */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Features</h4>
            <ul className="space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
              <li>PDF Tools</li>
              <li>Image Processing</li>
              <li>File Conversion</li>
              <li className="flex items-center gap-2">
                <Wand2 className="w-3 h-3" />
                Advanced Tools
              </li>
            </ul>
          </div>

          {/* Privacy */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Privacy</h4>
            <ul className="space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-center gap-2">
                <Shield className="w-3 h-3" />
                100% Local Processing
              </li>
              <li>No File Uploads</li>
              <li>Anonymous Analytics</li>
              <li>Open Source</li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Connect</h4>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="GitHub"
                title="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://x.com/bugingoflexon"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="X (Twitter)"
                title="X (Twitter) @bugingoflexon"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="/docs.html"
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors inline-flex items-center gap-1.5"
                title="Documentation"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="text-xs">Docs</span>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200/50 dark:border-gray-800/50 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            Made with <Heart className="w-4 h-4 text-red-500" /> for privacy-conscious professionals
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} FlexConvert. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
