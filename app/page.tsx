'use client'
import {useEffect} from 'react';
import {Input} from '@/app/components/ui/input'
import {Button} from '@/app/components/ui/button'
import {useState} from "react";
import {X, Settings2} from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,

    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
interface SectionItem {
    itemId: number;
    content: string;
}

interface SectionData {
    sectionId: number;
    sectionTitle: string;
    items: SectionItem[];
}

export default function Home() {
    const [activeSectionId, setActiveSectionId] = useState<number | null>(null);
    const [editingItemId, setEditingItemId] = useState<number | null>(null);
    const [sectionData, setSectionData] = useState<SectionData[]>([]);
    //const [loading, setLoading] = useState(false);
    const [newSectionTitle, setNewSectionTitle] = useState<string>('');

    const addNewSection = (sectionTitle: string) => {
        const newSectionData: SectionData = {
            sectionId: Date.now(),
            sectionTitle,
            items: [],
        };
        setSectionData([...sectionData,newSectionData]);
    }

    const handleAddNewSection = () => {
        addNewSection(newSectionTitle);
        setNewSectionTitle('');
    };

    const addItemToSection = (sectionId: number, content: string) => {
        setSectionData((prev) =>
            prev.map((section) =>
                section.sectionId === sectionId
                    ? {
                        ...section,
                        items: [...(section.items || []), { itemId: Date.now(), content }],
                    }
                    : section
            )
        );
    }

    const editItemContent = (sectionId: number, itemId: number, newContent: string) => {
        setSectionData((prev) =>
            prev.map((section) =>
                section.sectionId === sectionId
                    ? {
                        ...section,
                        items: section.items.map((item) =>
                            item.itemId === itemId ? { ...item, content: newContent } : item
                        ),
                    }
                    : section
            )
        );
    };

    const deleteItem = (sectionId: number, itemId: number) => {
        setSectionData((prev) =>
            prev.map((section) =>
                section.sectionId === sectionId
                    ? {
                        ...section,
                        items: section.items.filter((item) => item.itemId !== itemId),
                    }
                    : section
            )
        );
    };

    const deleteSection = (sectionId: number) => {
        setSectionData((prev) => prev.filter((section) => section.sectionId !== sectionId));
    };

    const updateSectionTitle = (sectionId: number, newTitle: string) => {
        setSectionData((prev) =>
            prev.map((section) =>
                section.sectionId === sectionId ? { ...section, sectionTitle: newTitle } : section
            )
        );
    };


    interface EditSectionProps {
        sectionId: number;
        sectionTitle: string;
        onUpdateSectionTitle: (sectionId: number, newTitle: string) => void;
        deleteSection: (sectionId: number) => void;
    }
    const EditSection = ({ sectionId, sectionTitle, onUpdateSectionTitle }: EditSectionProps)=> {

        const [editedTitle, setEditedTitle] = useState(sectionTitle);

        const handleSave = () => {
            onUpdateSectionTitle(sectionId, editedTitle);
        };

        return (
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Settings2 />
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <div className="flex w-full  items-center space-x-2">
                        <Input value={editedTitle}
                               onChange={(e) => setEditedTitle(e.target.value)}
                               placeholder="Edit section title"/>

                            <AlertDialogAction onClick={handleSave}>Save</AlertDialogAction>
                        </div>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this section
                             and remove the data from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <Button variant="destructive" onClick={() =>deleteSection(sectionId)}>Delete Section</Button>

                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        )
    }


    // Load from localStorage only once on mount
    useEffect(() => {
        const savedSectionData = localStorage.getItem('sectionData');
        if (savedSectionData) {
            try {
                setSectionData(JSON.parse(savedSectionData) as SectionData[]);
            } catch (error) {
                console.error('Error parsing section data:', error);
            }
        }
    }, []);

    // Save to localStorage whenever sectionData changes
    useEffect(() => {
        if (sectionData.length > 0) {
            localStorage.setItem('sectionData', JSON.stringify(sectionData));
        }
    }, [sectionData]);

  return (
    <div className="items-center justify-items-center min-h-screen p-8 pb-12  sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <Input
                placeholder="Add a section"
                className=" shadow-lg max-w-2xl text-center" // Adjust padding for the icon
                value={newSectionTitle}
                onChange={(e) => setNewSectionTitle(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        handleAddNewSection();
                    }
                }}
            />
        <div className={`grid gap-8 ${
            sectionData.length <= 2
                ? 'grid-cols-1'
                : sectionData.length < 5
                    ? 'grid-cols-2'
                    : sectionData.length < 7
                        ? 'grid-cols-3'
                        : 'grid-cols-4' // Optional fallback for more sections
        }`}>




        {sectionData?.map((section) => (
            <div key={section.sectionId} className="pt-8 min-w-48 ">



                                        <div className=" flex justify-between group ">
                            <h2 className='font-bold underline'>{section.sectionTitle} </h2>

                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">


                                        <EditSection sectionId={section.sectionId}
                                                     sectionTitle={section.sectionTitle}
                                                     deleteSection={deleteSection}
                                                     onUpdateSectionTitle={updateSectionTitle}/>
                                            </div>

                                    </div>


                {/* Render items */}
                                    {section.items?.map((item) => (
                                        <div key={item.itemId} className="pt-1 group flex items-center justify-between">
                                            {editingItemId === item.itemId ? (
                                                <div className="flex w-full">
                                                    <input
                                                        defaultValue={item.content}
                                                        autoFocus
                                                        onBlur={() => setEditingItemId(null)} // Stop editing on blur
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter" && e.currentTarget.value.trim() !== "") {
                                                                editItemContent(section.sectionId, item.itemId, e.currentTarget.value.trim());
                                                                setEditingItemId(null); // Stop editing
                                                            } else if (e.key === "Escape") {
                                                                setEditingItemId(null); // Cancel editing
                                                            }
                                                        }}
                                                        className="flex-1 border px-2 py-1"
                                                    />

                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-between w-full">
                                                    <p
                                                        onClick={() => {
                                                            setEditingItemId(item.itemId);
                                                            setActiveSectionId(null);
                                                        }}
                                                        className="cursor-pointer flex-1"
                                                    >
                                                        {item.content}
                                                    </p>
                                                    <button
                                                        onClick={() => deleteItem(section.sectionId, item.itemId)}
                                                        className="text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <X />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {activeSectionId === section.sectionId  &&
                <Input
                    placeholder={`Add content...`}
                    autoFocus
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            const target = e.target as HTMLInputElement;
                            if (target.value.trim() !== '') {
                                addItemToSection(section.sectionId, target.value.trim());
                                target.value = '';
                                setActiveSectionId(null)
                            }
                        }
                        else if (e.key === 'Escape') {
                            setActiveSectionId(null); // Close input on Escape
                        }
                    }}
                />
                }
                {activeSectionId != section.sectionId  &&
                <button className="font-light hover:underline hover:font-medium" onClick={() =>
                    setActiveSectionId((prev) =>
                        prev === section.sectionId ? null : section.sectionId

                    )
                }>+ Add item</button>
                }

            </div>

        ))}
        </div>
    </div>
  );
}
