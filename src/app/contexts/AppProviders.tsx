import type { ReactNode } from 'react'
import { NavigationProvider } from '#/app/contexts/NavigationContext'
import { NotificationProvider } from '#/app/contexts/NotificationContext'
import { ThemeProvider } from '#/app/contexts/ThemeContext'
import { DashboardProvider } from '#/app/contexts/DashboardContext'
import { ProjectProvider } from '#/app/contexts/ProjectContext'
import { PromptProvider } from '#/app/contexts/PromptContext'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <NavigationProvider>
          <DashboardProvider>
            <ProjectProvider>
              <PromptProvider>{children}</PromptProvider>
            </ProjectProvider>
          </DashboardProvider>
        </NavigationProvider>
      </NotificationProvider>
    </ThemeProvider>
  )
}
