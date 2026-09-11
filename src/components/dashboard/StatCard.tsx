import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { LucideIcon, TrendingDown, TrendingUp, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

export type StatCardData = {
  title: string
  value: string | number
  icon: LucideIcon
  change?: number
  changeType?: 'increase' | 'decrease' | 'neutral'
  periodText?: string
  themeColor?: 'blue' | 'emerald' | 'amber' | 'purple' | 'primary'
}

const themeColorStyles: Record<
  NonNullable<StatCardData['themeColor']>,
  { iconBg: string; iconColor: string; accentBorder: string }
> = {
  blue: {
    iconBg: 'bg-blue-500/10 dark:bg-blue-500/20',
    iconColor: 'text-blue-600 dark:text-blue-400',
    accentBorder: 'hover:border-blue-500/30',
  },
  emerald: {
    iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    accentBorder: 'hover:border-emerald-500/30',
  },
  amber: {
    iconBg: 'bg-amber-500/10 dark:bg-amber-500/20',
    iconColor: 'text-amber-600 dark:text-amber-400',
    accentBorder: 'hover:border-amber-500/30',
  },
  purple: {
    iconBg: 'bg-purple-500/10 dark:bg-purple-500/20',
    iconColor: 'text-purple-600 dark:text-purple-400',
    accentBorder: 'hover:border-purple-500/30',
  },
  primary: {
    iconBg: 'bg-primary/10 dark:bg-primary/20',
    iconColor: 'text-primary',
    accentBorder: 'hover:border-primary/30',
  },
}

const KPIChange = ({
  change,
  changeType,
  periodText,
}: {
  change?: number
  changeType?: 'increase' | 'decrease' | 'neutral'
  periodText?: string
}) => {
  if (changeType === 'neutral' || change === undefined) {
    return (
      <div className="flex items-center gap-1.5 pt-1 text-xs text-muted-foreground">
        <Badge variant="outline" size="sm" className="bg-muted/40 text-muted-foreground gap-1 px-1.5 py-0">
          <Minus className="h-3 w-3" />
          <span>0.0%</span>
        </Badge>
        {periodText && <span>{periodText}</span>}
      </div>
    )
  }

  const isIncrease = changeType === 'increase'
  const Icon = isIncrease ? TrendingUp : TrendingDown
  const changePercent = Math.abs(change).toLocaleString(undefined, {
    style: 'percent',
    minimumFractionDigits: 1,
  })

  return (
    <div className="flex items-center gap-2 pt-1 text-xs">
      <Badge
        size="sm"
        className={cn(
          'gap-1 font-semibold px-2 py-0.5 border',
          isIncrease
            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
        )}
      >
        <Icon className="h-3 w-3 shrink-0" />
        <span>
          {isIncrease ? '+' : '-'}
          {changePercent}
        </span>
      </Badge>
      {periodText && <span className="text-muted-foreground text-xs">{periodText}</span>}
    </div>
  )
}

export function StatCard({
  title,
  value,
  icon: Icon,
  change,
  changeType,
  periodText,
  themeColor = 'primary',
}: StatCardData) {
  const styles = themeColorStyles[themeColor] || themeColorStyles.primary

  return (
    <Card className={cn('p-5 rounded-2xl border bg-card shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5', styles.accentBorder)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 mb-3">
        <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</CardTitle>
        <div className={cn('p-2.5 rounded-xl shrink-0', styles.iconBg)}>
          <Icon className={cn('h-5 w-5', styles.iconColor)} />
        </div>
      </CardHeader>
      <CardContent className="p-0 space-y-1">
        <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">{value}</div>
        <KPIChange change={change} changeType={changeType} periodText={periodText} />
      </CardContent>
    </Card>
  )
}

export function StatCardSkeleton() {
  return (
    <Card className="p-5 rounded-2xl border bg-card shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 mb-3">
        <Skeleton className="h-3.5 w-32" />
        <Skeleton className="h-10 w-10 rounded-xl" />
      </CardHeader>
      <CardContent className="p-0 space-y-2">
        <Skeleton className="h-8 w-20" />
        <div className="flex items-center gap-2 pt-1">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-3 w-20" />
        </div>
      </CardContent>
    </Card>
  )
}

export function StatCardGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">{children}</div>
}
