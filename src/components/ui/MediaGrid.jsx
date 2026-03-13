import Grid from './Grid'

export default function MediaGrid({ children, className = '' }) {
  return <Grid className={className}>{children}</Grid>
}
