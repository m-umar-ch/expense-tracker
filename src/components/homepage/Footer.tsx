import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="border-t bg-card/30 py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-2 space-y-4">
            <h4 className="text-xl font-black tracking-tight">
              EXPENSE<span className="text-primary">TRACK</span>
            </h4>
            <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
              The only financial tool you'll ever need. Built with modern tech
              for maximum efficiency and total privacy. 100% Free, always.
            </p>
          </div>

          <div className="space-y-4">
            <h5 className="font-bold text-xs uppercase tracking-widest text-foreground">
              Product
            </h5>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="hover:text-primary cursor-pointer transition-colors">
                Features
              </li>
              <li className="hover:text-primary cursor-pointer transition-colors">
                Security
              </li>
              <li className="hover:text-primary cursor-pointer transition-colors">
                Open Source
              </li>
              <li className="hover:text-primary cursor-pointer transition-colors">
                Changelog
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h5 className="font-bold text-xs uppercase tracking-widest text-foreground">
              Community
            </h5>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="hover:text-primary cursor-pointer transition-colors">
                GitHub
              </li>
              <li className="hover:text-primary cursor-pointer transition-colors">
                Discord
              </li>
              <li className="hover:text-primary cursor-pointer transition-colors">
                Donations
              </li>
              <li className="hover:text-primary cursor-pointer transition-colors">
                Contact
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            © 2026 EXPENSETRACK PRO. ALL RIGHTS RESERVED.
          </p>
          <div className="flex gap-6 text-xs font-bold text-muted-foreground uppercase tracking-widest">
            <span className="hover:text-primary cursor-pointer transition-colors">
              Privacy Policy
            </span>
            <span className="hover:text-primary cursor-pointer transition-colors">
              Terms of Service
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
