/* eslint-disable */
'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import StudentIDCard from '@/components/students/StudentIDCard';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function StudentIdCardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const { data: student, isLoading } = useQuery({
    queryKey: ['student-id-card-page', id],
    queryFn: async () => {
      const res = await api.get(`/api/students/${id}/`);
      return res.data;
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        আইডি কার্ড লোড হচ্ছে...
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white gap-4">
        <p className="text-red-400">শিক্ষার্থী পাওয়া যায়নি।</p>
        <Link href="/students" className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs">
          শিক্ষার্থী তালিকায় ফিরুন
        </Link>
      </div>
    );
  }

  return (
    <StudentIDCard
      student={{
        id: student.id,
        student_id: student.student_id,
        name: student.name,
        name_bn: student.name_bn,
        photo: student.photo,
        roll_number: student.roll_number,
        academic_year: student.academic_year,
        islamic_department_name: student.islamic_department_name,
        islamic_department_name_bn: student.islamic_department_name_bn,
        general_department_name: student.general_department_name,
        general_department_name_bn: student.general_department_name_bn,
        guardian_name: student.guardian_name,
        guardian_phone: student.guardian_phone,
        present_address: student.present_address,
        residential_status: student.residential_status
      }}
      onClose={() => {
        window.history.back();
      }}
    />
  );
}
