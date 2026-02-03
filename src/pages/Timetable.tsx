import { useState } from 'react';
import { useClasses, useSubjects, useTimetable, useCreateTimetableEntry, useDeleteTimetableEntry, TimetableEntry } from '@/hooks/useSchoolData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, Clock, Loader2, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00'
];

export default function Timetable() {
  const { data: classes, isLoading: classesLoading } = useClasses();
  const { data: subjects, isLoading: subjectsLoading } = useSubjects();
  
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const { data: timetable, isLoading: timetableLoading } = useTimetable(selectedClassId || undefined);
  
  const createEntry = useCreateTimetableEntry();
  const deleteEntry = useDeleteTimetableEntry();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<TimetableEntry | null>(null);

  const [formData, setFormData] = useState({
    class_id: '',
    subject_id: '',
    day_of_week: 1,
    start_time: '09:00',
    end_time: '10:00',
    room: '',
  });

  const resetForm = () => {
    setFormData({
      class_id: selectedClassId || '',
      subject_id: '',
      day_of_week: 1,
      start_time: '09:00',
      end_time: '10:00',
      room: '',
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createEntry.mutateAsync(formData);
    setIsCreateOpen(false);
    resetForm();
  };

  const handleDelete = async () => {
    if (!selectedEntry) return;
    await deleteEntry.mutateAsync(selectedEntry.id);
    setIsDeleteOpen(false);
    setSelectedEntry(null);
  };

  const openDeleteDialog = (entry: TimetableEntry) => {
    setSelectedEntry(entry);
    setIsDeleteOpen(true);
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getEntriesForDayAndTime = (dayIndex: number) => {
    if (!timetable) return [];
    return timetable.filter(entry => entry.day_of_week === dayIndex);
  };

  const isLoading = classesLoading || subjectsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Filter to show only weekdays (Mon-Fri = indexes 1-5)
  const weekdays = DAYS.slice(1, 6);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Timetable</h1>
          <p className="text-muted-foreground">Manage class schedules and time slots</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-hero" disabled={!classes?.length || !subjects?.length}>
              <Plus className="h-4 w-4 mr-2" />
              Add Entry
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Add Timetable Entry</DialogTitle>
                <DialogDescription>Schedule a class for a specific time slot</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Class</Label>
                    <Select
                      value={formData.class_id}
                      onValueChange={(value) => setFormData({ ...formData, class_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes?.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Subject</Label>
                    <Select
                      value={formData.subject_id}
                      onValueChange={(value) => setFormData({ ...formData, subject_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects?.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id}>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: subject.color }}
                              />
                              {subject.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Day of Week</Label>
                  <Select
                    value={formData.day_of_week.toString()}
                    onValueChange={(value) => setFormData({ ...formData, day_of_week: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {weekdays.map((day, index) => (
                        <SelectItem key={day} value={(index + 1).toString()}>{day}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Time</Label>
                    <Select
                      value={formData.start_time}
                      onValueChange={(value) => setFormData({ ...formData, start_time: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_SLOTS.map((time) => (
                          <SelectItem key={time} value={time}>{formatTime(time)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>End Time</Label>
                    <Select
                      value={formData.end_time}
                      onValueChange={(value) => setFormData({ ...formData, end_time: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_SLOTS.map((time) => (
                          <SelectItem key={time} value={time}>{formatTime(time)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Room (Optional)</Label>
                  <Input
                    value={formData.room}
                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                    placeholder="e.g., Room 101"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createEntry.isPending || !formData.class_id || !formData.subject_id}
                >
                  {createEntry.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Add Entry
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Class Filter */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Filter by Class</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedClassId || "all"} onValueChange={(value) => setSelectedClassId(value === "all" ? "" : value)}>
            <SelectTrigger className="w-full md:w-64">
              <SelectValue placeholder="All Classes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {classes?.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Timetable Grid */}
      {!classes?.length || !subjects?.length ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Set up your curriculum first</h3>
              <p className="text-muted-foreground mb-4">
                You need to create classes and subjects before building a timetable
              </p>
            </div>
          </CardContent>
        </Card>
      ) : timetableLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Weekly Schedule</CardTitle>
            <CardDescription>
              {timetable?.length || 0} scheduled classes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {timetable?.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No scheduled classes</h3>
                <p className="text-muted-foreground mb-4">Start adding entries to build your timetable</p>
              </div>
            ) : (
              <div className="grid grid-cols-5 gap-4">
                {weekdays.map((day, dayIndex) => {
                  const entries = getEntriesForDayAndTime(dayIndex + 1);
                  return (
                    <div key={day} className="space-y-3">
                      <h3 className="font-semibold text-center py-2 bg-muted rounded-lg">
                        {day}
                      </h3>
                      {entries.length === 0 ? (
                        <p className="text-center text-sm text-muted-foreground py-4">
                          No classes
                        </p>
                      ) : (
                        entries.map((entry) => (
                          <div
                            key={entry.id}
                            className="p-3 rounded-lg border relative group"
                            style={{ 
                              borderLeftWidth: '4px',
                              borderLeftColor: (entry.subjects as any)?.color || '#3B82F6'
                            }}
                          >
                            <button
                              onClick={() => openDeleteDialog(entry)}
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                            </button>
                            <p className="font-medium text-sm">
                              {(entry.subjects as any)?.name}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {(entry.classes as any)?.name}
                            </p>
                            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {formatTime(entry.start_time)} - {formatTime(entry.end_time)}
                            </div>
                            {entry.room && (
                              <Badge variant="outline" className="mt-2 text-xs">
                                {entry.room}
                              </Badge>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Timetable Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this class from the schedule?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteEntry.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
