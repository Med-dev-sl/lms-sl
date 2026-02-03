import { useState } from 'react';
import { useStudents, useCreateStudent, useUpdateStudent, useDeleteStudent, useStudentParents, useLinkParent, useUnlinkParent, useSchoolParents, Student, CreateStudentData } from '@/hooks/useStudentData';
import { useClasses } from '@/hooks/useSchoolData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, MoreHorizontal, Pencil, Trash2, Users, Loader2, UserPlus, Link2, Unlink } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'graduated', label: 'Graduated' },
  { value: 'transferred', label: 'Transferred' },
];

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

const RELATIONSHIP_OPTIONS = [
  { value: 'parent', label: 'Parent' },
  { value: 'guardian', label: 'Guardian' },
  { value: 'other', label: 'Other' },
];

function StudentParentsSection({ student }: { student: Student }) {
  const { data: parents, isLoading } = useStudentParents(student.id);
  const { data: schoolParents } = useSchoolParents();
  const linkParent = useLinkParent();
  const unlinkParent = useUnlinkParent();
  
  const [isLinkOpen, setIsLinkOpen] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState('');
  const [relationship, setRelationship] = useState<'parent' | 'guardian' | 'other'>('parent');
  const [isPrimary, setIsPrimary] = useState(false);

  const availableParents = schoolParents?.filter(
    p => !parents?.some(sp => sp.parent_id === p.id)
  );

  const handleLink = async () => {
    if (!selectedParentId) return;
    await linkParent.mutateAsync({
      student_id: student.id,
      parent_id: selectedParentId,
      relationship,
      is_primary_contact: isPrimary,
    });
    setIsLinkOpen(false);
    setSelectedParentId('');
    setRelationship('parent');
    setIsPrimary(false);
  };

  const handleUnlink = async (id: string) => {
    await unlinkParent.mutateAsync({ id, studentId: student.id });
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-4"><Loader2 className="h-4 w-4 animate-spin" /></div>;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Linked Parents/Guardians</h4>
        <Dialog open={isLinkOpen} onOpenChange={setIsLinkOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Link2 className="h-3 w-3 mr-1" />
              Link Parent
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Link Parent/Guardian</DialogTitle>
              <DialogDescription>
                Connect a parent or guardian to {student.first_name} {student.last_name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Select Parent/Guardian</Label>
                <Select value={selectedParentId} onValueChange={setSelectedParentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a parent" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableParents?.length === 0 ? (
                      <SelectItem value="none" disabled>No available parents</SelectItem>
                    ) : (
                      availableParents?.map((parent) => (
                        <SelectItem key={parent.id} value={parent.id}>
                          {parent.full_name} ({parent.email})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Relationship</Label>
                <Select value={relationship} onValueChange={(v) => setRelationship(v as typeof relationship)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RELATIONSHIP_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="primary-contact"
                  checked={isPrimary}
                  onChange={(e) => setIsPrimary(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="primary-contact" className="text-sm font-normal">
                  Primary contact for this student
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsLinkOpen(false)}>Cancel</Button>
              <Button onClick={handleLink} disabled={!selectedParentId || linkParent.isPending}>
                {linkParent.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Link Parent
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {parents?.length === 0 ? (
        <p className="text-sm text-muted-foreground">No parents linked yet</p>
      ) : (
        <div className="space-y-2">
          {parents?.map((sp) => (
            <div key={sp.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
              <div>
                <p className="text-sm font-medium">{sp.profiles?.full_name}</p>
                <p className="text-xs text-muted-foreground">
                  {sp.profiles?.email} • {sp.relationship}
                  {sp.is_primary_contact && <Badge variant="secondary" className="ml-2 text-xs">Primary</Badge>}
                </p>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => handleUnlink(sp.id)}
                disabled={unlinkParent.isPending}
              >
                <Unlink className="h-4 w-4 text-muted-foreground hover:text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Students() {
  const { data: classes } = useClasses();
  const [filterClassId, setFilterClassId] = useState<string>('');
  const { data: students, isLoading } = useStudents(filterClassId || undefined);
  const createStudent = useCreateStudent();
  const updateStudent = useUpdateStudent();
  const deleteStudent = useDeleteStudent();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const [formData, setFormData] = useState<CreateStudentData & { status?: string }>({
    first_name: '',
    last_name: '',
    class_id: '',
    date_of_birth: '',
    gender: undefined,
    admission_number: '',
    address: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    notes: '',
  });

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      class_id: '',
      date_of_birth: '',
      gender: undefined,
      admission_number: '',
      address: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      notes: '',
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const data: CreateStudentData = {
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      class_id: formData.class_id || undefined,
      date_of_birth: formData.date_of_birth || undefined,
      gender: formData.gender || undefined,
      admission_number: formData.admission_number?.trim() || undefined,
      address: formData.address?.trim() || undefined,
      emergency_contact_name: formData.emergency_contact_name?.trim() || undefined,
      emergency_contact_phone: formData.emergency_contact_phone?.trim() || undefined,
      notes: formData.notes?.trim() || undefined,
    };
    await createStudent.mutateAsync(data);
    setIsCreateOpen(false);
    resetForm();
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    
    await updateStudent.mutateAsync({
      id: selectedStudent.id,
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      class_id: formData.class_id || undefined,
      date_of_birth: formData.date_of_birth || undefined,
      gender: formData.gender || undefined,
      admission_number: formData.admission_number?.trim() || undefined,
      address: formData.address?.trim() || undefined,
      emergency_contact_name: formData.emergency_contact_name?.trim() || undefined,
      emergency_contact_phone: formData.emergency_contact_phone?.trim() || undefined,
      notes: formData.notes?.trim() || undefined,
      status: formData.status as Student['status'],
    });
    setIsEditOpen(false);
    setSelectedStudent(null);
    resetForm();
  };

  const handleDelete = async () => {
    if (!selectedStudent) return;
    await deleteStudent.mutateAsync(selectedStudent.id);
    setIsDeleteOpen(false);
    setSelectedStudent(null);
  };

  const openEditDialog = (student: Student) => {
    setSelectedStudent(student);
    setFormData({
      first_name: student.first_name,
      last_name: student.last_name,
      class_id: student.class_id || '',
      date_of_birth: student.date_of_birth || '',
      gender: student.gender || undefined,
      admission_number: student.admission_number || '',
      address: student.address || '',
      emergency_contact_name: student.emergency_contact_name || '',
      emergency_contact_phone: student.emergency_contact_phone || '',
      notes: student.notes || '',
      status: student.status,
    });
    setIsEditOpen(true);
  };

  const openViewDialog = (student: Student) => {
    setSelectedStudent(student);
    setIsViewOpen(true);
  };

  const openDeleteDialog = (student: Student) => {
    setSelectedStudent(student);
    setIsDeleteOpen(true);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'inactive': return 'secondary';
      case 'graduated': return 'outline';
      case 'transferred': return 'destructive';
      default: return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Students</h1>
          <p className="text-muted-foreground">Manage student enrollment and parent links</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-hero">
              <UserPlus className="h-4 w-4 mr-2" />
              Enroll Student
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Enroll New Student</DialogTitle>
                <DialogDescription>Add a new student to your school</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name *</Label>
                    <Input
                      id="first_name"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      placeholder="John"
                      required
                      maxLength={100}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name *</Label>
                    <Input
                      id="last_name"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      placeholder="Doe"
                      required
                      maxLength={100}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Class</Label>
                    <Select
                      value={formData.class_id || "none"}
                      onValueChange={(v) => setFormData({ ...formData, class_id: v === "none" ? "" : v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Class Assigned</SelectItem>
                        {classes?.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Select
                      value={formData.gender || "none"}
                      onValueChange={(v) => setFormData({ ...formData, gender: v === "none" ? undefined : v as 'male' | 'female' | 'other' })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Not specified</SelectItem>
                        {GENDER_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input
                      id="dob"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admission_number">Admission Number</Label>
                    <Input
                      id="admission_number"
                      value={formData.admission_number}
                      onChange={(e) => setFormData({ ...formData, admission_number: e.target.value })}
                      placeholder="STU-2025-001"
                      maxLength={50}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Student's home address"
                    rows={2}
                    maxLength={500}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergency_name">Emergency Contact Name</Label>
                    <Input
                      id="emergency_name"
                      value={formData.emergency_contact_name}
                      onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                      placeholder="Jane Doe"
                      maxLength={100}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergency_phone">Emergency Contact Phone</Label>
                    <Input
                      id="emergency_phone"
                      type="tel"
                      value={formData.emergency_contact_phone}
                      onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                      placeholder="+1 234 567 8900"
                      maxLength={20}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Any additional notes about the student"
                    rows={2}
                    maxLength={1000}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createStudent.isPending || !formData.first_name || !formData.last_name}>
                  {createStudent.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Enroll Student
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
          <Select value={filterClassId || "all"} onValueChange={(v) => setFilterClassId(v === "all" ? "" : v)}>
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

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Students</CardTitle>
          <CardDescription>
            {students?.length || 0} student{students?.length !== 1 ? 's' : ''} enrolled
          </CardDescription>
        </CardHeader>
        <CardContent>
          {students?.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No students yet</h3>
              <p className="text-muted-foreground mb-4">Get started by enrolling your first student</p>
              <Button onClick={() => setIsCreateOpen(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Enroll Student
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Admission #</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students?.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">
                      {student.first_name} {student.last_name}
                    </TableCell>
                    <TableCell>{student.classes?.name || '-'}</TableCell>
                    <TableCell>{student.admission_number || '-'}</TableCell>
                    <TableCell className="capitalize">{student.gender || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(student.status)}>
                        {student.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openViewDialog(student)}>
                            <Users className="h-4 w-4 mr-2" />
                            View & Link Parents
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEditDialog(student)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => openDeleteDialog(student)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* View Student & Parents Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedStudent?.first_name} {selectedStudent?.last_name}
            </DialogTitle>
            <DialogDescription>
              {selectedStudent?.classes?.name || 'No class assigned'} • {selectedStudent?.status}
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="parents" className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="parents">Parents</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="space-y-3 mt-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Admission #</p>
                  <p className="font-medium">{selectedStudent?.admission_number || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date of Birth</p>
                  <p className="font-medium">{selectedStudent?.date_of_birth || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Gender</p>
                  <p className="font-medium capitalize">{selectedStudent?.gender || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Enrollment Date</p>
                  <p className="font-medium">{selectedStudent?.enrollment_date}</p>
                </div>
              </div>
              {selectedStudent?.address && (
                <div className="text-sm">
                  <p className="text-muted-foreground">Address</p>
                  <p className="font-medium">{selectedStudent.address}</p>
                </div>
              )}
              {(selectedStudent?.emergency_contact_name || selectedStudent?.emergency_contact_phone) && (
                <div className="text-sm">
                  <p className="text-muted-foreground">Emergency Contact</p>
                  <p className="font-medium">
                    {selectedStudent.emergency_contact_name}
                    {selectedStudent.emergency_contact_phone && ` • ${selectedStudent.emergency_contact_phone}`}
                  </p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="parents" className="mt-4">
              {selectedStudent && <StudentParentsSection student={selectedStudent} />}
            </TabsContent>
          </Tabs>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsViewOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleEdit}>
            <DialogHeader>
              <DialogTitle>Edit Student</DialogTitle>
              <DialogDescription>Update student information</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_first_name">First Name *</Label>
                  <Input
                    id="edit_first_name"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    required
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_last_name">Last Name *</Label>
                  <Input
                    id="edit_last_name"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    required
                    maxLength={100}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Class</Label>
                  <Select
                    value={formData.class_id || "none"}
                    onValueChange={(v) => setFormData({ ...formData, class_id: v === "none" ? "" : v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Class Assigned</SelectItem>
                      {classes?.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(v) => setFormData({ ...formData, status: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select
                    value={formData.gender || "none"}
                    onValueChange={(v) => setFormData({ ...formData, gender: v === "none" ? undefined : v as 'male' | 'female' | 'other' })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Not specified</SelectItem>
                      {GENDER_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_dob">Date of Birth</Label>
                  <Input
                    id="edit_dob"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_admission">Admission Number</Label>
                <Input
                  id="edit_admission"
                  value={formData.admission_number}
                  onChange={(e) => setFormData({ ...formData, admission_number: e.target.value })}
                  maxLength={50}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_address">Address</Label>
                <Textarea
                  id="edit_address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={2}
                  maxLength={500}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_emergency_name">Emergency Contact Name</Label>
                  <Input
                    id="edit_emergency_name"
                    value={formData.emergency_contact_name}
                    onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_emergency_phone">Emergency Contact Phone</Label>
                  <Input
                    id="edit_emergency_phone"
                    type="tel"
                    value={formData.emergency_contact_phone}
                    onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                    maxLength={20}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_notes">Notes</Label>
                <Textarea
                  id="edit_notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  maxLength={1000}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateStudent.isPending}>
                {updateStudent.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Student</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove "{selectedStudent?.first_name} {selectedStudent?.last_name}"? 
              This will also remove all parent links. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteStudent.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
