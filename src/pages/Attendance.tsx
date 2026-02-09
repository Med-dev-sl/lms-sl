import { useState, useMemo, useEffect } from 'react';
import { useClasses } from '@/hooks/useSchoolData';
import { useStudents } from '@/hooks/useStudentData';
import { useClassAttendance, useMarkAttendance, useWeeklyAttendanceReport, AttendanceEntry } from '@/hooks/useAttendanceData';
import { format, startOfWeek, endOfWeek, addDays, subWeeks, addWeeks } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { CalendarIcon, Check, ChevronLeft, ChevronRight, Loader2, Save, Users } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const STATUS_OPTIONS: { value: 'present' | 'absent' | 'late' | 'excused'; label: string; color: string }[] = [
  { value: 'present', label: 'Present', color: 'bg-green-500' },
  { value: 'absent', label: 'Absent', color: 'bg-destructive' },
  { value: 'late', label: 'Late', color: 'bg-yellow-500' },
  { value: 'excused', label: 'Excused', color: 'bg-blue-500' },
];

function StatusBadge({ status }: { status: string }) {
  const opt = STATUS_OPTIONS.find(s => s.value === status);
  return (
    <Badge variant="outline" className="gap-1.5">
      <span className={cn('h-2 w-2 rounded-full', opt?.color || 'bg-muted')} />
      {opt?.label || status}
    </Badge>
  );
}

function DailyAttendance({ classId }: { classId: string }) {
  const [date, setDate] = useState<Date>(new Date());
  const dateStr = format(date, 'yyyy-MM-dd');
  const { data: students, isLoading: studentsLoading } = useStudents(classId);
  const { data: existingAttendance, isLoading: attendanceLoading } = useClassAttendance(classId, dateStr);
  const markAttendance = useMarkAttendance();

  const [entries, setEntries] = useState<Record<string, AttendanceEntry>>({});

  // Sync existing attendance into local state
  useEffect(() => {
    if (!students) return;
    const map: Record<string, AttendanceEntry> = {};
    students.forEach(s => {
      const existing = existingAttendance?.find(a => a.student_id === s.id);
      map[s.id] = {
        student_id: s.id,
        status: existing?.status || 'present',
        notes: existing?.notes || '',
      };
    });
    setEntries(map);
  }, [students, existingAttendance]);

  const setStatus = (studentId: string, status: AttendanceEntry['status']) => {
    setEntries(prev => ({ ...prev, [studentId]: { ...prev[studentId], status } }));
  };

  const handleSave = () => {
    markAttendance.mutate({
      classId,
      date: dateStr,
      entries: Object.values(entries),
    });
  };

  const markAllPresent = () => {
    const updated: Record<string, AttendanceEntry> = {};
    Object.entries(entries).forEach(([id, e]) => {
      updated[id] = { ...e, status: 'present' };
    });
    setEntries(updated);
  };

  const isLoading = studentsLoading || attendanceLoading;

  const summary = useMemo(() => {
    const vals = Object.values(entries);
    return {
      total: vals.length,
      present: vals.filter(e => e.status === 'present').length,
      absent: vals.filter(e => e.status === 'absent').length,
      late: vals.filter(e => e.status === 'late').length,
      excused: vals.filter(e => e.status === 'excused').length,
    };
  }, [entries]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-32"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <CalendarIcon className="h-4 w-4" />
              {format(date, 'PPP')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => d && setDate(d)}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={markAllPresent}>
            <Check className="h-4 w-4 mr-1" /> Mark All Present
          </Button>
          <Button onClick={handleSave} disabled={markAttendance.isPending || !students?.length}>
            {markAttendance.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save Attendance
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold">{summary.total}</p><p className="text-xs text-muted-foreground">Total</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-green-600">{summary.present}</p><p className="text-xs text-muted-foreground">Present</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-destructive">{summary.absent}</p><p className="text-xs text-muted-foreground">Absent</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-yellow-600">{summary.late}</p><p className="text-xs text-muted-foreground">Late</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-blue-600">{summary.excused}</p><p className="text-xs text-muted-foreground">Excused</p></CardContent></Card>
      </div>

      {!students?.length ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">No students in this class</CardContent></Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Adm No.</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student, idx) => (
                <TableRow key={student.id}>
                  <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                  <TableCell className="font-medium">{student.first_name} {student.last_name}</TableCell>
                  <TableCell className="text-muted-foreground">{student.admission_number || '—'}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {STATUS_OPTIONS.map(opt => (
                        <Button
                          key={opt.value}
                          size="sm"
                          variant={entries[student.id]?.status === opt.value ? 'default' : 'outline'}
                          className={cn(
                            'text-xs h-7 px-2',
                            entries[student.id]?.status === opt.value && opt.value === 'present' && 'bg-green-600 hover:bg-green-700',
                            entries[student.id]?.status === opt.value && opt.value === 'absent' && 'bg-destructive hover:bg-destructive/90',
                            entries[student.id]?.status === opt.value && opt.value === 'late' && 'bg-yellow-500 hover:bg-yellow-600 text-white',
                            entries[student.id]?.status === opt.value && opt.value === 'excused' && 'bg-blue-500 hover:bg-blue-600',
                          )}
                          onClick={() => setStatus(student.id, opt.value)}
                        >
                          {opt.label}
                        </Button>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}

function WeeklyReport({ classId }: { classId: string }) {
  const [weekOffset, setWeekOffset] = useState(0);
  const baseDate = addWeeks(new Date(), weekOffset);
  const weekStart = startOfWeek(baseDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(baseDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 5 }, (_, i) => addDays(weekStart, i)); // Mon-Fri

  const { data: students } = useStudents(classId);
  const { data: records, isLoading } = useWeeklyAttendanceReport(
    classId,
    format(weekStart, 'yyyy-MM-dd'),
    format(weekEnd, 'yyyy-MM-dd')
  );

  const getStatus = (studentId: string, date: string) => {
    return records?.find(r => r.student_id === studentId && r.date === date)?.status;
  };

  const getStudentStats = (studentId: string) => {
    const studentRecords = records?.filter(r => r.student_id === studentId) || [];
    const present = studentRecords.filter(r => r.status === 'present' || r.status === 'late').length;
    const total = studentRecords.length;
    return { present, total, percentage: total > 0 ? Math.round((present / total) * 100) : 0 };
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-32"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="icon" onClick={() => setWeekOffset(w => w - 1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="font-medium">
          {format(weekStart, 'MMM d')} – {format(weekEnd, 'MMM d, yyyy')}
        </h3>
        <Button variant="outline" size="icon" onClick={() => setWeekOffset(w => w + 1)} disabled={weekOffset >= 0}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {!students?.length ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">No students in this class</CardContent></Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                {weekDays.map(d => (
                  <TableHead key={d.toISOString()} className="text-center w-20">
                    <div>{format(d, 'EEE')}</div>
                    <div className="text-xs text-muted-foreground">{format(d, 'MMM d')}</div>
                  </TableHead>
                ))}
                <TableHead className="text-center w-28">Attendance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map(student => {
                const stats = getStudentStats(student.id);
                return (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.first_name} {student.last_name}</TableCell>
                    {weekDays.map(d => {
                      const status = getStatus(student.id, format(d, 'yyyy-MM-dd'));
                      return (
                        <TableCell key={d.toISOString()} className="text-center">
                          {status ? <StatusBadge status={status} /> : <span className="text-muted-foreground text-xs">—</span>}
                        </TableCell>
                      );
                    })}
                    <TableCell>
                      <div className="space-y-1">
                        <Progress value={stats.percentage} className="h-2" />
                        <p className="text-xs text-center text-muted-foreground">{stats.percentage}%</p>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}

export default function Attendance() {
  const { data: classes, isLoading: classesLoading } = useClasses();
  const [selectedClassId, setSelectedClassId] = useState<string>('');

  useEffect(() => {
    if (classes?.length && !selectedClassId) {
      setSelectedClassId(classes[0].id);
    }
  }, [classes, selectedClassId]);

  if (classesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Attendance</h1>
          <p className="text-muted-foreground">Track daily attendance and view weekly reports</p>
        </div>
        <div className="flex items-center gap-3">
          <Users className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedClassId || 'none'} onValueChange={(v) => setSelectedClassId(v === 'none' ? '' : v)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select a class" />
            </SelectTrigger>
            <SelectContent>
              {!classes?.length ? (
                <SelectItem value="none" disabled>No classes available</SelectItem>
              ) : (
                classes.map(cls => (
                  <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!selectedClassId ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <CardTitle className="mb-2">Select a Class</CardTitle>
            <CardDescription>Choose a class to start marking attendance or view reports.</CardDescription>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="daily">
          <TabsList>
            <TabsTrigger value="daily">Daily Attendance</TabsTrigger>
            <TabsTrigger value="weekly">Weekly Report</TabsTrigger>
          </TabsList>
          <TabsContent value="daily" className="mt-4">
            <DailyAttendance classId={selectedClassId} />
          </TabsContent>
          <TabsContent value="weekly" className="mt-4">
            <WeeklyReport classId={selectedClassId} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
