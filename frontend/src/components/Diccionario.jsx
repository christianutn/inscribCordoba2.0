import React, { useState, useEffect, useRef } from "react";
import { getCategoriasChatbot, insertCategoriasChatbot } from "../services/categoriaChatbot.service.js";
import { getDiccionarioChatbot, insertDiccionarioChatbot } from "../services/diccionarioChatbot.service.js";
import { getDiccionarioChatbotnr } from "../services/diccionarioChatbotnr.service.js";
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';


const DiccionarioChat = ({ chatMessages }) => {
    const { Buffer } = require('buffer');
    // const [imageBase64, setImageBase64] = useState({})
    // const convertBlobToBase64 = (blob) => {
    //     return new Promise((resolve, reject) => {
    //         const reader = new FileReader();
    //         reader.onloadend = () => {
    //             resolve(reader.result.split(',')[1]); // Devuelve solo la parte base64
    //         };
    //         reader.onerror = reject;
    //         reader.readAsDataURL(blob);
    //     });
    // };
    function convertFileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                resolve(reader.result); // Devuelve la cadena base64
            };
            reader.onerror = reject;
            reader.readAsDataURL(file); // Convierte el archivo a base64
        });
    }

    const [newMessage, setNewMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [opcionesValidas, setValidas] = useState([]);
    const [estado, setEstado] = useState("1");
    const [estadoPregunta, setEstadoP] = useState("0");
    const [isTyping, setIsTyping] = useState(false); // Nuevo estado

    const [categories, setCategories] = useState(["General", "Técnica"]);
    const [newCategory, setNewCategory] = useState("");
    const [newCategoryM, setNewCategoryM] = useState("");
    const [newQuestion, setNewQuestion] = useState("");
    const [newAnswer, setNewAnswer] = useState("");
    const [newImage, setNewImage] = useState(null);
    const [unfoundQuestions, setUnfoundQuestions] = useState([]);
    const [registeredQuestions, setRegisteredQuestions] = useState([]);
    const fileInputRef = useRef(null);

    const [imageBase64, setImageBase64] = useState('');
    const handleAddCategory = async (e) => {
        if (newCategory.trim() && !categories.includes(newCategory)) {
            try {
                const response = await insertCategoriasChatbot({ nombre: newCategory });
                Swal.fire({
                    icon: 'success',
                    title: 'Registro exitoso',
                    text: 'La nueva categoría se registró exitosamente.',
                    confirmButtonText: 'Ok',
                });
                const categorias = await getCategoriasChatbot();
                const categoryList = categorias.map((categoria) => ({
                    id: categoria.id,
                    nombre: categoria.nombre,
                }));
                setNewCategoryM("");
                return;
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error,
                    confirmButtonText: 'Ok',
                });
            }
        }
        else {
            Swal.fire({
                icon: 'warning',
                title: 'Categoría duplicada o vacía',
                text: 'La categoría ya existe o el nombre está vacío.',
                confirmButtonText: 'Ok',
            });
        }
    };
    const handleRegisterQuestion = async (e) => {
        console.log("Nueva categoria: ", newCategory);
        console.log("Nueva pregunta: ", newQuestion);
        console.log("Nueva respuesta: ", newAnswer);
        console.log("Nueva imagen: ", newImage);
        try {
            const response = await insertDiccionarioChatbot(
                {
                    pregunta: newQuestion,
                    respuesta: newAnswer,
                    imagen: newImage,
                    idCategoria: newCategory
                });
            Swal.fire({
                icon: 'success',
                title: 'Registro exitoso',
                text: 'Se registró la nueva pregunta correctamente.',
                confirmButtonText: 'Ok',
            });
            const registradas = await getDiccionarioChatbot("", "");

            // Actualizando el estado con las preguntas obtenidas
            setRegisteredQuestions(registradas.map((question) => ({
                id: question.id,
                question: question.pregunta,
                answer: question.respuesta,
                image: question.imagen,
                categoryId: question.idCategoria
            })));

            try {
                const noRegistradas = await getDiccionarioChatbotnr();
                // // Llenar el estado con los datos obtenidos
                setUnfoundQuestions(noRegistradas);
            }
            catch (error) { }
            setNewCategory("0");
            setNewQuestion("");
            setNewAnswer("");
            resetFileInput();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: '...Oops',
                text: error,
                confirmButtonText: 'Ok',
            });
        }
    };
    const handleFileChange = (e) => {
        const file = e.target.files[0]; // Obtén el primer archivo seleccionado

        if (file) {
            // Convierte el archivo a base64 y guarda la imagen en el estado
            convertFileToBase64(file).then(base64String => {
                setImageBase64(base64String);
            }).catch(error => {
                console.error('Error al convertir el archivo a base64:', error);
            });

            // Guarda el archivo completo en el estado (si es necesario)
            setNewImage(file);
            console.log('Archivo completo:', file);
        }
    };

    const resetFileInput = () => {
        setNewImage(null); // Limpia el estado
        if (fileInputRef.current) {
            fileInputRef.current.value = ""; // Resetea el input
        }
    };
    const handleNewMessageChange = (e) => {
        setNewMessage(e.target.value);
    };
    const onKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            if (newMessage.trim() === "") {
                if (estado === "0" || estado === "1") {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Campo vacío',
                        text: 'Por favor, ingresá una de las opciones antes de continuar.',
                        confirmButtonText: 'Entendido',
                    });
                    return;
                }
                if (estado === "2") {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Campo vacío',
                        text: 'Por favor, escribí tú pregunta antes de continuar.',
                        confirmButtonText: 'Entendido',
                    });
                    return;
                }
            } else {
                realizarAccionEspecificaBusqueda();
            }
        }
    };
    const validar = () => {
        const categorySelect = document.getElementById("categorySelect");
        const questionInput = document.getElementById("questionInput");
        const answerInput = document.getElementById("answerInput");

        // Verificar que se haya seleccionado una categoría válida
        if (categorySelect.value === "0" || categorySelect.value === "") {
            categorySelect.focus();
            Swal.fire({
                icon: 'warning',
                title: 'Campo vacío',
                text: 'Por favor, seleccioná una categoría antes de continuar.',
                confirmButtonText: 'Entendido',
            });
            return;
        }

        // Verificar que el campo de pregunta no esté vacío
        if (questionInput.value.trim() === "") {
            questionInput.focus();
            Swal.fire({
                icon: 'warning',
                title: 'Campo vacío',
                text: 'Por favor, escribí tu pregunta antes de continuar.',
                confirmButtonText: 'Entendido',
            });
            return;
        }

        // Verificar que el campo de respuesta no esté vacío
        if (answerInput.value.trim() === "") {
            answerInput.focus();
            Swal.fire({
                icon: 'warning',
                title: 'Campo vacío',
                text: 'Por favor, ingresá una respuesta antes de continuar.',
                confirmButtonText: 'Entendido',
            });
            return;
        }

        // Si todo está bien, proceder con la acción específica
        realizarAccionEspecificaBusqueda();
    };

    function validarEntero(valor) {
        return Number.isInteger(valor);
    }
    function realizarAccionEspecificaBusqueda() {
        var btnBusca = document.getElementById("btnRegistrar");
        btnBusca.click();
    }
    useEffect(() => {
        const textarea = document.getElementById("textAreaExample");
        if (textarea) {
            textarea.focus();
        }
        (async () => {
            const categorias = await getCategoriasChatbot();
            const categoryList = categorias.map((categoria) => ({
                id: categoria.id,
                nombre: categoria.nombre,
            }));
            setCategories([
                { id: "0", nombre: "Seleccioná una categoría" },
                ...categoryList,
            ]);

            const registradas = await getDiccionarioChatbot("", "");
            setRegisteredQuestions(registradas.map((question) => ({
                id: question.id,
                question: question.pregunta,
                answer: question.respuesta,
                image: question.imagen,
                categoryId: question.idCategoria
            })));
            console.log("Registradas ", registeredQuestions)
            // const fetchImages = async () => {
            //     const newImageBase64 = {};
            //     for (let i = 0; i < registeredQuestions.length; i++) {
            //         const q = registeredQuestions[i];
            //         if (q.image && q.image instanceof Blob) {
            //             try {
            //                 const base64String = await convertBlobToBase64(q.image);
            //                 newImageBase64[i] = base64String; // Guarda la imagen codificada en base64
            //                 q.image = base64String;
            //             } catch (error) {
            //                 console.error("Error al convertir el Blob a base64:", error);
            //             }
            //         }
            //     }
            //     setImageBase64(newImageBase64);
            // };
            // fetchImages();
            console.log("Registradas ", registeredQuestions)
            try {
                const noRegistradas = await getDiccionarioChatbotnr();
                // // Llenar el estado con los datos obtenidos
                setUnfoundQuestions(noRegistradas);
            }
            catch (error) { }
        })();
    }, []);
    return (
        <section style={{ backgroundColor: "#eee", width: "100 vh", display: "flex", flexDirection: "column" }}>
            <div className="container py-5 scrollable-div">
                <div className="row d-flex justify-content-center">
                    <div className="col-md-12 col-lg-12 col-xl-12">
                        <div className="card" id="chat1" style={{ borderRadius: "15px" }}>
                            <div
                                className="card-header d-flex justify-content-between align-items-center p-3 bg-info text-white border-bottom-0"
                                style={{
                                    borderTopLeftRadius: "15px",
                                    borderTopRightRadius: "15px",
                                }}
                            >
                                <i className="fas fa-angle-left"></i>
                                <p className="mb-0 fw-bold">Asistencia Campus (base de conocimiento)</p>
                                <i className="fas fa-times"></i>
                            </div>
                            <div className="card-body" >
                                <div
                                    className="modal fade"
                                    id="addCategoryModal"
                                    tabIndex="-1"
                                    aria-labelledby="addCategoryModalLabel"
                                    aria-hidden="true"
                                >
                                    <div className="modal-dialog">
                                        <div className="modal-content">
                                            <div className="modal-header">
                                                <h5 className="modal-title" id="addCategoryModalLabel">
                                                    Agregar Nueva Categoría
                                                </h5>
                                                <button
                                                    type="button"
                                                    className="btn-close"
                                                    data-bs-dismiss="modal"
                                                    aria-label="Close"
                                                ></button>
                                            </div>
                                            <div className="modal-body">
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Nombre de la categoría"
                                                    value={newCategoryM}
                                                    onChange={(e) => setNewCategoryM(e.target.value)}
                                                />
                                            </div>
                                            <div className="modal-footer">
                                                <button
                                                    type="button"
                                                    className="btn btn-danger"
                                                    data-bs-dismiss="modal"
                                                >
                                                    Cancelar
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-primary"
                                                    onClick={handleAddCategory}
                                                    data-bs-dismiss="modal"
                                                >
                                                    Guardar
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="container mt-4">
                                    {/* Formulario para nuevas preguntas */}
                                    <div className="card mb-4">
                                        <div className="card-body">
                                            <h5 className="card-title">Registrar Nueva Pregunta</h5>
                                            <div className="mb-3">
                                                <label htmlFor="categorySelect" className="form-label">Categoría</label>
                                                <div className="input-group">
                                                    <select
                                                        className="form-select"
                                                        id="categorySelect"
                                                        value={newCategory}
                                                        onChange={(e) => setNewCategory(e.target.value)}>
                                                        {categories.map((category) => (
                                                            <option key={category.id} value={category.id}>
                                                                {category.nombre}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <button
                                                        className="btn btn-success"
                                                        data-bs-toggle="modal"
                                                        data-bs-target="#addCategoryModal"
                                                        title="Agregar categoría"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="mb-3">
                                                <label htmlFor="questionInput" className="form-label">Pregunta</label>
                                                <textarea
                                                    id="questionInput"
                                                    className="form-control"
                                                    rows="2"
                                                    value={newQuestion}
                                                    onChange={(e) => setNewQuestion(e.target.value)}
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label htmlFor="answerInput" className="form-label">Respuesta</label>
                                                <textarea
                                                    id="answerInput"
                                                    className="form-control"
                                                    rows="2"
                                                    value={newAnswer}
                                                    onChange={(e) => setNewAnswer(e.target.value)}
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label htmlFor="imageInput" className="form-label">Imagen</label>
                                                <input
                                                    type="file"
                                                    className="form-control"
                                                    id="imageInput"
                                                    ref={fileInputRef}
                                                    onChange={handleFileChange}
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                className="btn btn-primary btn-block"
                                                onClick={validar}
                                                style={{ display: "block" }}
                                            >
                                                Registrar Pregunta
                                            </button>
                                            <button id="btnRegistrar" className="btn btn-primary" style={{ display: "none" }} onClick={handleRegisterQuestion}>
                                                Registrar Pregunta
                                            </button>
                                        </div>
                                    </div>
                                    {/* Grillas */}
                                    <div className="row"><hr></hr><br></br></div>
                                    <div className="row">
                                        {/* Preguntas no registradas */}
                                        <div className="col-md-12">
                                            <h5 className="text-primary fw-bold mb-4">Preguntas No Encontradas</h5>
                                            {unfoundQuestions.length === 0 ? (
                                                <p className="text-muted">No hay preguntas no encontradas</p>
                                            ) : (
                                                <div className="table-responsive" style={{ borderRadius: "10px", maxHeight: "250px" }}>
                                                    <table className="table table-bordered table-sm table-striped table-hover rounded-4 shadow-sm" style={{ height: "150px", overflowY: "auto", border: "1px solid #dee2e6", borderRadius: "4px", boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)" }}>
                                                        <thead className="table-danger text-center" style={{ position: "sticky", top: "0", zIndex: "2", backgroundColor: "#f8d7da" }}>
                                                            <tr>
                                                                <th>#</th>
                                                                <th>Pregunta</th>
                                                                <th>Incidencia</th>
                                                                <th>Procesada</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {unfoundQuestions.map((question, index) => (
                                                                <tr key={question.id} className={`text-center ${index % 2 === 0 ? "table-light" : "table-default"}`}>
                                                                    <td>{index + 1}</td>
                                                                    <td>{question.pregunta}</td>
                                                                    <td>{question.incidencia}</td>
                                                                    {question.pocesada ? (
                                                                        <td className="text-success fw-bold">Procesada</td>
                                                                    ) : (
                                                                        <td>
                                                                            <button className="btn btn-warning btn-sm">Procesar</button>
                                                                        </td>
                                                                    )}
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="row"><hr></hr><br></br></div>
                                    <div className="row">
                                        {/* Preguntas registradas */}
                                        <div className="col-md-12">
                                            <h5 className="text-primary fw-bold mb-4">Preguntas Registradas</h5>
                                            {registeredQuestions.length === 0 ? (
                                                <p className="text-muted">No hay preguntas registradas</p>
                                            ) : (
                                                <div className="table-responsive" style={{ borderRadius: "10px", maxHeight: "250px" }}>
                                                    <table className="table table-bordered table-sm table-striped table-hover rounded-4 shadow-lg" style={{ height: "150px", overflowY: "auto", border: "1px solid #dee2e6", borderRadius: "4px", boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)" }}>
                                                        <thead className="table-success text-center" style={{ position: "sticky", top: "0", zIndex: "2", backgroundColor: "#f8d7da" }}>
                                                            <tr>
                                                                <th>#</th>
                                                                <th>Pregunta</th>
                                                                <th>Respuesta</th>
                                                                <th>Imagen</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {registeredQuestions.map((q, index) => (
                                                                <tr
                                                                    key={index}
                                                                    className={`text-center ${index % 2 === 0 ? "table-light" : "table-default"}`}
                                                                >
                                                                    <td>{index + 1}</td>
                                                                    <td>{q.question}</td>
                                                                    <td>{q.answer}</td>
                                                                    <td>
                                                                        {q.image ? (
                                                                            <img
                                                                                src={`data:image/jpeg;base64,${Buffer.from(q.image).toString('base64')}`}
                                                                                alt="Pregunta"
                                                                                className="img-fluid img-thumbnail"
                                                                                style={{ maxWidth: "100px", height: "auto" }}
                                                                            />
                                                                        ) : (
                                                                            <span className="text-muted">Sin imagen</span>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>

                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* <footer className="bg-dark text-white text-center py-3" style={{ marginTop: "auto", marginBottom: "20px" }}>
                <div className="container">
                    <p className="mb-0">&copy; {new Date().getFullYear()} Campus. Todos los derechos reservados.</p>
                </div>
            </footer> */}
        </section >

    );
};

export default DiccionarioChat;
