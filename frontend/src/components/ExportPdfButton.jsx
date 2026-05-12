import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function ExportPdfButton({
  targetId,
  filename = "report.pdf",
  label = "Xuất PDF",
}) {
  const handleExport = async () => {
    const element = document.getElementById(targetId);

    if (!element) {
      alert("Không tìm thấy nội dung để xuất PDF");
      return;
    }

    let cloneWrapper = null;

    try {
      cloneWrapper = document.createElement("div");
      cloneWrapper.style.position = "fixed";
      cloneWrapper.style.left = "-9999px";
      cloneWrapper.style.top = "0";
      cloneWrapper.style.width = `${element.offsetWidth}px`;
      cloneWrapper.style.background = "#020617";
      cloneWrapper.style.color = "#ffffff";

      const clone = element.cloneNode(true);

      clone.querySelectorAll("*").forEach((el) => {
        el.style.color = "#ffffff";
        el.style.backgroundColor = "transparent";
        el.style.borderColor = "#1f2937";
        el.style.boxShadow = "none";
      });

      clone.querySelectorAll("img").forEach((img) => {
        img.crossOrigin = "anonymous";
      });

      cloneWrapper.appendChild(clone);
      document.body.appendChild(cloneWrapper);

      const canvas = await html2canvas(cloneWrapper, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#020617",
      });

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(filename);
    } catch (error) {
      console.error("EXPORT PDF ERROR:", error);
      alert(error.message || "Lỗi xuất PDF");
    } finally {
      if (cloneWrapper) {
        document.body.removeChild(cloneWrapper);
      }
    }
  };

  return (
    <button
      onClick={handleExport}
      className="rounded-2xl bg-green-500 px-5 py-3 font-medium text-slate-950 hover:bg-green-400"
    >
      {label}
    </button>
  );
}