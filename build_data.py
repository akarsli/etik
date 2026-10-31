import re
import json

def clean_text(t):
    return re.sub(r"\s+", " ", t).strip()

def parse_file(filepath, collection_id, collection_title):
    with open(filepath, "r", encoding="utf-8") as f:
        text = f.read()

    header_re = re.compile(r"={10,}\s*\n(.*?QUIZ\s+\d+.*?)\n={10,}", re.IGNORECASE)
    splits = list(header_re.finditer(text))
    
    quizzes = []
    
    for idx, match in enumerate(splits):
        quiz_title = match.group(1).strip()
        start_pos = match.end()
        end_pos = splits[idx+1].start() if idx + 1 < len(splits) else len(text)
        chunk = text[start_pos:end_pos]
        
        # Extract preamble notes before the first question
        first_q = re.search(r"(?:^|\n)\d+\)\s+", chunk)
        notes = ""
        questions_body = chunk
        if first_q:
            notes = chunk[:first_q.start()].strip()
            notes = re.sub(r"^[-=\s]+|[-=\s]+$", "", notes)
            questions_body = chunk[first_q.start():]
        
        # Split into question blocks
        q_splits = list(re.finditer(r"(?:^|\n)(\d+)\)\s+([\s\S]*?)(?=(?:\n\d+\)\s+|\Z))", questions_body))
        
        parsed_questions = []
        for qs in q_splits:
            q_num = int(qs.group(1))
            q_raw = qs.group(2).strip()
            
            lines = q_raw.split("\n")
            
            q_text_lines = []
            opt_lines = []
            ans_lines = []
            
            mode = "question"
            for line in lines:
                sline = line.strip()
                if "✔ Cevap:" in line or re.match(r"^\s*✔?\s*Cevap:", line):
                    mode = "answer"
                    ans_lines.append(line)
                elif mode == "answer":
                    ans_lines.append(line)
                elif re.match(r"^\s*\[[ ✔xX*]*\]", line):
                    mode = "options"
                    opt_lines.append(line)
                elif mode == "options":
                    if line.startswith("   ") and not re.match(r"^\s*\[", line):
                        if opt_lines:
                            opt_lines[-1] += " " + sline
                    else:
                        opt_lines.append(line)
                else:
                    q_text_lines.append(line)
            
            question_text = clean_text(" ".join(q_text_lines))
            raw_answer = "\n".join(ans_lines).strip()
            clean_ans = re.sub(r"^\s*✔?\s*Cevap:\s*", "", raw_answer).strip() if raw_answer else ""
            
            # Parse options
            options = []
            correct_key = None
            
            for oline in opt_lines:
                om = re.match(r"^\s*\[([ ✔xX*]*)\]\s*([a-zA-ZğüşıöçĞÜŞİÖÇ\d\.\)\-]+)?\s*(.*)", oline)
                if om:
                    checked = bool("✔" in om.group(1) or "x" in om.group(1).lower() or "*" in om.group(1))
                    prefix = (om.group(2) or "").strip()
                    rest = (om.group(3) or "").strip()
                    
                    full_str = (prefix + " " + rest).strip()
                    
                    # True/False check
                    if full_str.lower().startswith("doğru") or full_str.lower().startswith("yanlış"):
                        key = "Doğru" if full_str.lower().startswith("doğru") else "Yanlış"
                        opt_text = key
                    else:
                        clean_prefix = re.sub(r"[\)\.]", "", prefix).strip()
                        key = clean_prefix if clean_prefix else str(len(options) + 1)
                        opt_text = rest if rest else full_str
                    
                    if checked:
                        correct_key = key
                    
                    options.append({
                        "key": key,
                        "text": opt_text,
                        "isCorrect": checked
                    })
            
            # Determine Question Type
            if len(options) == 0:
                q_type = "open_ended"
            elif len(options) == 2 and any(o["key"] in ["Doğru", "Yanlış"] for o in options):
                q_type = "true_false"
            else:
                q_type = "multiple_choice"
            
            # Extract explanation and correct key for multiple_choice / true_false
            explanation = ""
            if clean_ans:
                # Find trailing explanation in parentheses
                last_paren = re.search(r"\(([^)]+)\)\s*$", clean_ans)
                if last_paren:
                    explanation = last_paren.group(1).strip()
                
                if q_type != "open_ended":
                    if not correct_key:
                        u_ans = clean_ans.upper()
                        if "DOĞRU" in u_ans:
                            correct_key = "Doğru"
                        elif "YANLIŞ" in u_ans:
                            correct_key = "Yanlış"
                        else:
                            mkey = re.match(r"^([a-zA-Z])[\)\.\s]", clean_ans)
                            if mkey:
                                correct_key = mkey.group(1)
                else:
                    correct_key = None
            
            # Ensure correct option is flagged
            if correct_key:
                for opt in options:
                    if opt["key"].lower() == correct_key.lower():
                        opt["isCorrect"] = True
            
            parsed_questions.append({
                "id": f"{collection_id}_{idx+1}_{q_num}",
                "number": q_num,
                "type": q_type,
                "text": question_text,
                "options": options,
                "correctKey": correct_key,
                "answerRaw": raw_answer,
                "answerText": clean_ans,
                "explanation": explanation,
                "needsReview": "[kontrol et]" in q_raw
            })
            
        quizzes.append({
            "id": idx + 1,
            "title": quiz_title,
            "notes": notes,
            "questionCount": len(parsed_questions),
            "questions": parsed_questions
        })
        
    return {
        "id": collection_id,
        "title": collection_title,
        "quizCount": len(quizzes),
        "totalQuestions": sum(q["questionCount"] for q in quizzes),
        "quizzes": quizzes
    }

yeni_data = parse_file("quiz_derleme_yeni.txt", "yeni", "Quiz Derlemesi (Yeni - Güncel)")
eski_data = parse_file("quiz derleme eski.txt", "eski", "Quiz Derlemesi (Eski - Kapsamlı)")

output_data = {
    "yeni": yeni_data,
    "eski": eski_data
}

with open("quiz_data.js", "w", encoding="utf-8") as f:
    f.write("// Otomatik oluşturulan Mühendislik Etiği Quiz Veritabanı\n")
    f.write("const QUIZ_COLLECTIONS = ")
    f.write(json.dumps(output_data, ensure_ascii=False, indent=2))
    f.write(";\n")

print("Generated quiz_data.js with refined parser!")
