import { UserCircle, Award, ChevronRight, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { toBanglaDigit } from '@/lib/numberToBanglaWords';

export interface StudentProps {
    id: number | string;
    student_id?: string;
    photo?: string;
    name?: string;
    name_bn: string;
    islamic_department_name_bn?: string;
    general_department_name_bn?: string;
    islamic_department_name?: string;
    general_department_name?: string;
    roll_number?: number | string;
    status: string;
    [key: string]: any;
}

export default function StudentCard({ 
  student, 
  onPrintId,
  onDelete
}: { 
  student: StudentProps;
  onPrintId?: (student: any) => void;
  onDelete?: (student: any) => void;
}) {
    const dept = student.islamic_department_name_bn || student.general_department_name_bn || student.islamic_department_name || student.general_department_name || 'সাধারণ';

    return (
        <div className="bg-white p-3.5 rounded-2xl shadow-sm hover:shadow-md border border-slate-100 transition-all flex items-center justify-between gap-3 group">
            <Link href={`/students/${student.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                {student.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={student.photo} alt={student.name_bn} className="w-12 h-12 rounded-xl object-cover border border-emerald-200" />
                ) : (
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
                        <UserCircle size={32} className="text-emerald-700" />
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-sm text-gray-900 truncate group-hover:text-emerald-800 transition-colors">
                          {student.name_bn || student.name}
                        </h4>
                        {student.status === 'expelled' && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-100 text-rose-800 font-extrabold border border-rose-300 shrink-0">
                            বহিষ্কৃত
                          </span>
                        )}
                        {student.status === 'inactive' && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 font-bold border border-slate-300 shrink-0">
                            নিষ্ক্রিয়
                          </span>
                        )}
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      {student.student_id} • {dept}
                      {student.roll_number && ` • রোল: ${toBanglaDigit(student.roll_number)}`}
                    </p>
                </div>
            </Link>

            <div className="flex items-center gap-1.5">
                <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      onPrintId?.(student);
                    }}
                    className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition-transform active:scale-95 flex items-center gap-1"
                    title="আইডি কার্ড প্রিন্ট"
                >
                    <Award className="w-3.5 h-3.5 text-amber-600" />
                    <span className="hidden sm:inline">আইডি কার্ড</span>
                </button>
                {onDelete && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      onDelete(student);
                    }}
                    className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-transform active:scale-95 flex items-center justify-center"
                    title="শিক্ষার্থী বাদ দিন"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  </button>
                )}
                <Link
                    href={`/students/${student.id}`}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-gray-500 hover:text-gray-900 transition-colors"
                    title="প্রোফাইল দেখুন"
                >
                    <ChevronRight className="w-4 h-4" />
                </Link>
            </div>
        </div>
    );
}
