@@ .. @@
               onClick={() => setTheme('light')}
               className={`flex items-center justify-between rounded-lg border p-4 transition-colors ${
                 theme === 'light' 
                   ? 'border-primary bg-primary/5 text-primary' 
                   : 'border-[hsl(var(--color-border))] hover:border-primary/50'
               }`}
+              aria-pressed={(theme === 'light').toString()}
             >
               <div className="flex items-center gap-3">
                 <Sun className="h-5 w-5" />
@@ .. @@
               onClick={() => setTheme('dark')}
               className={`flex items-center justify-between rounded-lg border p-4 transition-colors ${
                 theme === 'dark' 
                   ? 'border-primary bg-primary/5 text-primary' 
                   : 'border-[hsl(var(--color-border))] hover:border-primary/50'
               }`}
+              aria-pressed={(theme === 'dark').toString()}
             >
               <div className="flex items-center gap-3">
                 <Moon className="h-5 w-5" />
@@ .. @@
               onClick={() => setTheme('time-based')}
               className={`flex items-center justify-between rounded-lg border p-4 transition-colors ${
                 theme === 'time-based' 
                   ? 'border-primary bg-primary/5 text-primary' 
                   : 'border-[hsl(var(--color-border))] hover:border-primary/50'
               }`}
+              aria-pressed={(theme === 'time-based').toString()}
             >
               <div className="flex items-center gap-3">
                 <Laptop className="h-5 w-5" />