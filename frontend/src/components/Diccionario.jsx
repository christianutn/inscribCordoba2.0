import React, { useState, useEffect } from "react";
import { getCategoriasChatbot, insertCategoriasChatbot } from "../services/categoriaChatbot.service.js"
import { getDiccionarioChatbot, getDiccionarioChatbotPuntual } from "../services/diccionarioChatbot.service.js"
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const DiccionarioChat = ({ chatMessages }) => {
    const [newMessage, setNewMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [opcionesValidas, setValidas] = useState([]);
    const [estado, setEstado] = useState("1");
    const [estadoPregunta, setEstadoP] = useState("0");
    const [isTyping, setIsTyping] = useState(false); // Nuevo estado

    const [categories, setCategories] = useState(["General", "Técnica"]);
    const [newCategory, setNewCategory] = useState("");
    const [newQuestion, setNewQuestion] = useState("");
    const [newAnswer, setNewAnswer] = useState("");
    const [newImage, setNewImage] = useState(null);
    const [unfoundQuestions, setUnfoundQuestions] = useState([]);
    const [registeredQuestions, setRegisteredQuestions] = useState([]);

    const handleAddCategory = async (e) => {
        console.log("Nueva categoria a registrar", newCategory);
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
                setCategories([
                    { id: "0", nombre: "Seleccioná una categoría" },
                    ...categoryList,
                ]);
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

    const handleRegisterQuestion = () => {
        if (newQuestion.trim() && newAnswer.trim()) {
            setRegisteredQuestions([
                ...registeredQuestions,
                { question: newQuestion, answer: newAnswer, image: newImage },
            ]);
            setNewQuestion("");
            setNewAnswer("");
            setNewImage(null);
        }
    };

    const handleFileChange = (e) => {
        setNewImage(e.target.files[0]);
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
    const validar = (e) => {
        if (newMessage.trim() === "") {
            const alertText = estado === "2"
                ? 'Por favor, escribí tu pregunta antes de continuar.'
                : 'Por favor, ingresá una de las opciones antes de continuar.';

            Swal.fire({
                icon: 'warning',
                title: 'Campo vacío',
                text: alertText,
                confirmButtonText: 'Entendido',
            });
            return;
        } else {
            realizarAccionEspecificaBusqueda();
        }
    };
    const handleSendMessage = async (e) => {
        console.log("Estado inicial: ", estado);
        e.preventDefault();
        if (newMessage.trim() === "") return;

        const newMessageObject = {
            side: 2,
            menssage: newMessage,
            imagen: null,
        };
        setMessages([...messages, newMessageObject]);
        setNewMessage("");

        // Simula que el bot está escribiendo
        setIsTyping(true);

        // Lógica para validar si el mensaje es un número entero
        // if (validarEntero(parseInt(newMessage, 10))) {
        if (estado === "0") {
            const datosDeDiccionariosChatbotPorIdCategoria = await getDiccionarioChatbot("", newMessage);
            let preguntas = "Estas con las opciones que puedo darte:\r\n";
            preguntas += "0: Volver al menú principal\r\n";
            const misOpciones = [];
            if (datosDeDiccionariosChatbotPorIdCategoria.length > 0) {
                datosDeDiccionariosChatbotPorIdCategoria.forEach((element) => {
                    preguntas += `${element.id}: ${element.pregunta}\r\n`;
                    misOpciones.push(element.id.toString());
                });
                localStorage.setItem('opcionesValidas', JSON.stringify(misOpciones));
                preguntas += `x: &#128073; Escribí tu pregunta si no encontrás una opción\r\n`;
                preguntas = preguntas.replace(/\r\n/g, "<br>");
                setMessages((prevMessages) => [
                    ...prevMessages,
                    {
                        side: 1,
                        menssage: preguntas || 'Sin respuesta'
                    },
                ]);
                setEstado("1");
                setIsTyping(false);
                console.log("Estado final: ", estado);
                return;
            } else {
                let error = `&#10060; La opción ingresada es incorrecta.\r\nIngrese una de las opciones siguientes:\r\n`;
                const categorias = await getCategoriasChatbot();
                categorias.forEach((element) => {
                    error += `${element.id}: ${element.nombre}\r\n`;
                });
                error = error.replace(/\r\n/g, "<br>");
                setMessages((prevMessages) => [
                    ...prevMessages,
                    {
                        side: 1,
                        menssage: error || 'Sin respuesta'
                    },
                ]);
                setEstado("0");
                setIsTyping(false);
                console.log("Estado final: ", estado);
                return;
            }
        }
        if (estado === "1") {
            if (newMessage === "0") {
                setEstado("0");
                const categorias = await getCategoriasChatbot();
                let primerPregunta = "Ingresá una opción:\r\n";
                categorias.forEach((element) => {
                    primerPregunta += `${element.id}) ${element.nombre}\r\n`;
                });
                primerPregunta = primerPregunta.replace(/\r\n/g, "<br>");
                setMessages((prevMessages) => [
                    ...prevMessages,
                    {
                        side: 1,
                        menssage: primerPregunta || 'Sin respuesta'
                    },
                ]);
                setIsTyping(false);
                setEstadoP("0");
                console.log("Estado final: ", estado);
                return;
            }
            if (newMessage === "x" || newMessage === "X") {
                // Acción para "x", cuando el usuario quiera hacer una pregunta personalizada
                setEstado("2");
                setEstadoP("1");
                setMessages((prevMessages) => [
                    ...prevMessages,
                    {
                        side: 1,
                        menssage: "Por favor, escribí tu pregunta que voy a tratar de responderte, o sino ingresá 0 (cero) para volver al menú principal."
                    },
                ]);
                setIsTyping(false);
                console.log("Estado final: ", estado);
                return;
            }
            if (estado === "1") {
                if (estadoPregunta === "0") {
                    if (newMessage === "0") {
                        setEstado("0");
                        const categorias = await getCategoriasChatbot();
                        let primerPregunta = "Ingresá una opción:\r\n";
                        categorias.forEach((element) => {
                            primerPregunta += `${element.id}) ${element.nombre}\r\n`;
                        });
                        primerPregunta = primerPregunta.replace(/\r\n/g, "<br>");
                        setMessages((prevMessages) => [
                            ...prevMessages,
                            {
                                side: 1,
                                menssage: primerPregunta || 'Sin respuesta'
                            },
                        ]);
                        setIsTyping(false);
                        setEstadoP("0");
                        console.log("Estado final: ", estado);
                        return;
                    }
                    if (newMessage === "x" || newMessage === "X") {
                        // Acción para "x", cuando el usuario quiera hacer una pregunta personalizada
                        setEstado("2");
                        setEstadoP("0");
                        setMessages((prevMessages) => [
                            ...prevMessages,
                            {
                                side: 1,
                                menssage: "Por favor, escribí tu pregunta que voy a tratar de responderte, o sino ingresá 0 (cero) para volver al menú principal."
                            },
                        ]);
                        setIsTyping(false);
                        console.log("Estado final: ", estado);
                        return;
                    }
                    if (newMessage != "0" && newMessage != "x" && newMessage != "X") {
                        // Validación de una opción seleccionada
                        const opcionesValidas = JSON.parse(localStorage.getItem('opcionesValidas')) || [];
                        console.log(opcionesValidas);
                        if (opcionesValidas.includes(newMessage.trim())) {
                            const preguntaPuntual = await getDiccionarioChatbotPuntual(newMessage);
                            let respuesta = "";
                            respuesta += `0: Volver al menú principal\r\n`;
                            preguntaPuntual.forEach((element) => {
                                respuesta += `&#9989; ${element.respuesta}\r\n`;
                            });
                            respuesta = respuesta.replace(/\r\n/g, "<br>");
                            setMessages((prevMessages) => [
                                ...prevMessages,
                                {
                                    side: 1,
                                    menssage: respuesta || 'Sin respuesta'
                                },
                            ]);
                            setEstadoP("1");
                            setIsTyping(false);
                            console.log("Estado final: ", estado);
                            return;
                        }
                        else {
                            let condicion = "Debe ingresar una opción válida";
                            setMessages((prevMessages) => [
                                ...prevMessages,
                                {
                                    side: 1,
                                    menssage: condicion || 'Sin respuesta'
                                },
                            ]);
                            setIsTyping(false);
                            return;
                        }
                    }
                }
                else {
                    let condicion = "La única opción válida es 0 (cero)";
                    setMessages((prevMessages) => [
                        ...prevMessages,
                        {
                            side: 1,
                            menssage: condicion || 'Sin respuesta'
                        },
                    ]);
                    setIsTyping(false);
                    return;
                }
            }
        }
        if (estado === "2") {
            if (newMessage === "0") {
                setEstado("0");
                const categorias = await getCategoriasChatbot();
                let primerPregunta = "";
                categorias.forEach((element) => {
                    primerPregunta += `${element.id}: ${element.nombre}\r\n`;
                });
                primerPregunta = primerPregunta.replace(/\r\n/g, "<br>");
                setMessages((prevMessages) => [
                    ...prevMessages,
                    {
                        side: 1,
                        menssage: primerPregunta || 'Sin respuesta'
                    },
                ]);
                setIsTyping(false);
                return;
            }
            else {
                const preguntaPuntual = await getDiccionarioChatbot(newMessage, "");
                if (preguntaPuntual.length > 0) {
                    let respuesta = "";
                    respuesta += `0: Volver al menú principal\r\n`;
                    preguntaPuntual.forEach((element) => {
                        respuesta += `&#9989; ${element.respuesta}\r\n`;
                    });
                    respuesta = respuesta.replace(/\r\n/g, "<br>");
                    setMessages((prevMessages) => [
                        ...prevMessages,
                        {
                            side: 1,
                            menssage: respuesta || 'Sin respuesta'
                        },
                    ]);
                    setIsTyping(false);
                }
                else {
                    let respuesta = "";
                    respuesta += `0: Volver al menú principal\r\n`;
                    respuesta += `&#10060;Mis disculpas, no tengo una respuesta concreta para tu pregunta, pero podes escribir a nuestro equipo de administradores que sabrán brindarte una atención mas especializada. Escribinos a <span style='color:blue'>consultascampuscordoba@cba.gov.ar</span>.`;
                    respuesta = respuesta.replace(/\r\n/g, "<br>");
                    setMessages((prevMessages) => [
                        ...prevMessages,
                        {
                            side: 1,
                            menssage: respuesta || 'Sin respuesta'
                        },
                    ]);
                    setIsTyping(false);
                }
            }
        }
        // Finaliza la simulación de escritura
        console.log("Estado final: ", estado);
        setIsTyping(false);
    };
    function validarEntero(valor) {
        return Number.isInteger(valor);
    }
    function realizarAccionEspecificaBusqueda() {
        var btnBusca = document.getElementById("btnPreguntar");
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
        })();
    }, []);
    return (
        <section style={{ backgroundColor: "#eee", width: "100 %" }}>
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
                                                    value={newCategory}
                                                    onChange={(e) => setNewCategory(e.target.value)}
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
                                                    <select className="form-select" id="categorySelect">
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
                                                    onChange={handleFileChange}
                                                />
                                            </div>
                                            <button className="btn btn-primary" onClick={handleRegisterQuestion}>
                                                Registrar Pregunta
                                            </button>
                                        </div>
                                    </div>

                                    {/* Grillas */}
                                    <div className="row">
                                        <div className="col-md-12">
                                            <h5>Preguntas No Encontradas</h5>
                                            {unfoundQuestions.length === 0 ? (
                                                <p className="text-muted">No hay preguntas no encontradas</p>
                                            ) : (
                                                <div className="table-responsive">
                                                    <table className="table table-striped">
                                                        <thead>
                                                            <tr>
                                                                <th>#</th>
                                                                <th>Pregunta</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {/* {unfoundQuestions.map((question, index) => (
                                                                <tr key={index}>
                                                                    <td>{index + 1}</td>
                                                                    <td>{question}</td>
                                                                </tr>
                                                            ))} */}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>

                                    </div>
                                    <div className="row">
                                        {/* Preguntas registradas */}
                                        <div className="col-md-12">
                                            <h5>Preguntas Registradas</h5>
                                            {registeredQuestions.length === 0 ? (
                                                <p className="text-muted">No hay preguntas registradas</p>
                                            ) : (
                                                <div className="table-responsive">
                                                    <table className="table table-striped">
                                                        <thead>
                                                            <tr>
                                                                <th>#</th>
                                                                <th>Pregunta</th>
                                                                <th>Respuesta</th>
                                                                <th>Imagen</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {/* {registeredQuestions.map((q, index) => (
                                                                <tr key={index}>
                                                                    <td>{index + 1}</td>
                                                                    <td>{q.question}</td>
                                                                    <td>{q.answer}</td>
                                                                    <td>
                                                                        {q.image ? (
                                                                            <img
                                                                                src={URL.createObjectURL(q.image)}
                                                                                alt="Pregunta"
                                                                                className="img-thumbnail"
                                                                                style={{ width: "100px", height: "auto" }}
                                                                            />
                                                                        ) : (
                                                                            "Sin imagen"
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            ))} */}
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
        </section>
    );
};

export default DiccionarioChat;
