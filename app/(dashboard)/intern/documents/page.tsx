"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileDown, FileText, Upload, FolderSync } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

export default function InternDocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false); // Simulated data loading

  useEffect(() => {
    // Simulated fetch for documents specific to interns
    setTimeout(() => {
      setDocuments([
        { id: 1, name: "Internship_Agreement", type: "PDF", dateAdded: new Date(2023, 10, 1), status: "Signed" },
        { id: 2, name: "NDA_Form", type: "PDF", dateAdded: new Date(), status: "Pending Signature" },
        { id: 3, name: "Employee_Handbook", type: "PDF", dateAdded: new Date(), status: "Read" },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleDownload = (docId: number) => {
    toast.info("Downloading document...");
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Documents</h2>
        <div className="flex items-center space-x-2">
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            Upload Document
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Signatures</CardTitle>
            <FolderSync className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">
              {documents.filter((d: any) => d.status === "Pending Signature").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Files</CardTitle>
          <CardDescription>View, download, and sign required company documents</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date Added</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center"><Spinner className="mx-auto" /></TableCell></TableRow>
              ) : documents.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No documents found.</TableCell></TableRow>
              ) : (
                documents.map((doc: any) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      {doc.name}
                    </TableCell>
                    <TableCell>{doc.type}</TableCell>
                    <TableCell>{format(doc.dateAdded, 'PP')}</TableCell>
                    <TableCell>
                      <Badge variant={
                        doc.status === "Signed" || doc.status === "Read" ? "outline" : "destructive"
                      } className={doc.status === "Signed" || doc.status === "Read" ? "border-emerald-500 text-emerald-500" : ""}>
                        {doc.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleDownload(doc.id)} title="Download">
                        <FileDown className="h-4 w-4" />
                      </Button>
                      {doc.status === "Pending Signature" && (
                        <Button variant="link" size="sm" className="ml-2 text-indigo-600 font-semibold" onClick={() => toast.success("Document Signed!")}>
                          Sign Here
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}