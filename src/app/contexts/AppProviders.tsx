import type { ReactNode } from 'react'
import { NavigationProvider } from '#/app/contexts/NavigationContext'
import { NotificationProvider } from '#/app/contexts/NotificationContext'
import { ThemeProvider } from '#/app/contexts/ThemeContext'
import { DashboardProvider } from '#/app/contexts/DashboardContext'
import { ProjectProvider } from '#/app/contexts/ProjectContext'
import { PromptProvider } from '#/app/contexts/PromptContext'
import { BusinessProvider } from '#/app/contexts/BusinessContext'
import { TenantProvider } from '#/app/contexts/TenantContext'
import { AskSrgRuntimeProvider } from '#/app/contexts/AskSrgRuntimeContext'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <TenantProvider>
          <AskSrgRuntimeProvider>
            <NavigationProvider>
              <DashboardProvider>
                <ProjectProvider>
                  <PromptProvider>
                    <BusinessProvider>{children}</BusinessProvider>
                  </PromptProvider>
                </ProjectProvider>
              </DashboardProvider>
            </NavigationProvider>
          </AskSrgRuntimeProvider>
        </TenantProvider>
      </NotificationProvider>
    </ThemeProvider>
  )
}
